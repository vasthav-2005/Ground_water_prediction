package com.gwprediction.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gwprediction.dto.PredictionRequest;
import com.gwprediction.dto.PredictionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class PythonBridgeService {

    private static final Logger log = LoggerFactory.getLogger(PythonBridgeService.class);

    @Value("${python.executable:python}")
    private String pythonExecutable;

    @Value("${python.script.path:ml-model/predict_script.py}")
    private String pythonScriptPath;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public PredictionResponse invokePythonModel(PredictionRequest request) {
        try {
            String resolvedPython = resolvePythonExecutable();
            File scriptFile = resolveScriptFile();

            log.info("Invoking Python script [{}] using executable [{}]", scriptFile.getAbsolutePath(), resolvedPython);

            Map<String, Object> payloadMap = new LinkedHashMap<>();
            payloadMap.put("station", request.getStation() != null ? request.getStation() : "");
            payloadMap.put("station_code", request.getStationCode() != null ? request.getStationCode() : 0);
            payloadMap.put("year", request.getYear() != null ? request.getYear() : 2025);
            payloadMap.put("month", request.getMonth());
            payloadMap.put("day", request.getDay() != null ? request.getDay() : 15);
            payloadMap.put("hour", request.getHour() != null ? request.getHour() : 12);
            payloadMap.put("day_of_year", request.getDayOfYear() != null ? request.getDayOfYear() : 150);
            payloadMap.put("gwl_lag1", request.getGwlLag1() != null ? request.getGwlLag1() : 18.5);
            payloadMap.put("gwl_lag2", request.getGwlLag2() != null ? request.getGwlLag2() : 18.6);
            payloadMap.put("gwl_lag4", request.getGwlLag4() != null ? request.getGwlLag4() : 18.8);
            payloadMap.put("gwl_diff_1", request.getGwlDiff1() != null ? request.getGwlDiff1() : -0.1);
            payloadMap.put("gwl_roll_mean_24h", request.getGwlRollMean24h() != null ? request.getGwlRollMean24h() : 18.5);
            payloadMap.put("gwl_roll_mean_48h", request.getGwlRollMean48h() != null ? request.getGwlRollMean48h() : 18.55);
            payloadMap.put("gwl_roll_std_24h", request.getGwlRollStd24h() != null ? request.getGwlRollStd24h() : 0.05);

            String inputJson = objectMapper.writeValueAsString(payloadMap);
            String base64Payload = Base64.getEncoder().encodeToString(inputJson.getBytes(StandardCharsets.UTF_8));

            ProcessBuilder pb = new ProcessBuilder(
                resolvedPython,
                scriptFile.getAbsolutePath(),
                base64Payload
            );

            pb.directory(scriptFile.getParentFile());
            pb.redirectErrorStream(false);

            Process process = pb.start();

            // Read output stream directly
            String outputStr;
            try (InputStream is = process.getInputStream();
                 BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line).append("\n");
                }
                outputStr = sb.toString().trim();
            }

            boolean finished = process.waitFor(10, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                throw new RuntimeException("Python inference process timed out after 10s.");
            }

            int exitCode = process.exitValue();
            if (exitCode != 0) {
                String errStr;
                try (InputStream es = process.getErrorStream();
                     BufferedReader errReader = new BufferedReader(new InputStreamReader(es, StandardCharsets.UTF_8))) {
                    StringBuilder sbErr = new StringBuilder();
                    String line;
                    while ((line = errReader.readLine()) != null) {
                        sbErr.append(line).append("\n");
                    }
                    errStr = sbErr.toString().trim();
                }
                log.error("Python script exited with code {}. Error: {}", exitCode, errStr);
                throw new RuntimeException("Python inference error: " + errStr);
            }

            log.info("Python script output: {}", outputStr);

            PredictionResponse response = objectMapper.readValue(outputStr, PredictionResponse.class);
            response.setTimestamp(System.currentTimeMillis());
            return response;

        } catch (Exception e) {
            log.error("Failed to invoke Python model", e);
            throw new RuntimeException("Error executing ML prediction engine: " + e.getMessage(), e);
        }
    }

    private String resolvePythonExecutable() {
        File venvPy = new File("myvenv/Scripts/python.exe");
        if (venvPy.exists()) {
            return venvPy.getAbsolutePath();
        }
        File relativeVenv = new File("../myvenv/Scripts/python.exe");
        if (relativeVenv.exists()) {
            return relativeVenv.getAbsolutePath();
        }
        File venvPyLinux = new File("myvenv/bin/python");
        if (venvPyLinux.exists()) {
            return venvPyLinux.getAbsolutePath();
        }
        return pythonExecutable;
    }

    private File resolveScriptFile() {
        File file = new File(pythonScriptPath);
        if (file.exists()) {
            return file;
        }
        File relative = new File("../ml-model/predict_script.py");
        if (relative.exists()) {
            return relative;
        }
        File rootDir = new File("ml-model/predict_script.py");
        if (rootDir.exists()) {
            return rootDir;
        }
        return file;
    }
}
