package com.gwprediction.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gwprediction.dto.PredictionRequest;
import com.gwprediction.dto.PredictionResponse;
import com.gwprediction.dto.StationDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class PredictionService {

    private static final Logger log = LoggerFactory.getLogger(PredictionService.class);

    private final PythonBridgeService pythonBridgeService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public PredictionService(PythonBridgeService pythonBridgeService) {
        this.pythonBridgeService = pythonBridgeService;
    }

    public PredictionResponse predictGroundwaterLevel(PredictionRequest request) {
        // Set default temporal inputs if not provided
        if (request.getYear() == null) {
            request.setYear(2025);
        }
        if (request.getDay() == null) {
            request.setDay(15);
        }
        if (request.getHour() == null) {
            request.setHour(12);
        }

        // Auto-calculate DayOfYear
        if (request.getDayOfYear() == null || request.getDayOfYear() <= 0) {
            try {
                LocalDate date = LocalDate.of(request.getYear(), request.getMonth(), request.getDay());
                request.setDayOfYear(date.getDayOfYear());
            } catch (Exception e) {
                request.setDayOfYear(150);
            }
        }

        // Set default historical lag values if not provided
        if (request.getGwlLag1() == null) {
            request.setGwlLag1(18.5);
        }
        if (request.getGwlLag2() == null) {
            request.setGwlLag2(18.6);
        }
        if (request.getGwlLag4() == null) {
            request.setGwlLag4(18.8);
        }

        // Auto-calculate GWL Diff 1
        if (request.getGwlDiff1() == null) {
            request.setGwlDiff1(request.getGwlLag1() - request.getGwlLag2());
        }

        // Rolling statistics defaults
        if (request.getGwlRollMean24h() == null) {
            request.setGwlRollMean24h(request.getGwlLag1());
        }
        if (request.getGwlRollMean48h() == null) {
            request.setGwlRollMean48h((request.getGwlLag1() + request.getGwlLag2()) / 2.0);
        }
        if (request.getGwlRollStd24h() == null) {
            request.setGwlRollStd24h(0.05);
        }

        log.info("Processing groundwater level prediction request for station: [{}], month: [{}]", request.getStation(), request.getMonth());
        return pythonBridgeService.invokePythonModel(request);
    }

    public List<StationDto> getAvailableStations() {
        List<StationDto> stations = new ArrayList<>();
        try {
            File stationsFile = resolveStationsFile();
            if (stationsFile != null && stationsFile.exists()) {
                JsonNode root = objectMapper.readTree(stationsFile);
                JsonNode stationsArray = root.get("stations");
                if (stationsArray != null && stationsArray.isArray()) {
                    for (JsonNode node : stationsArray) {
                        stations.add(StationDto.builder()
                            .code(node.get("code").asInt())
                            .name(node.get("name").asText())
                            .build());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to load stations.json dynamically: {}", e.getMessage());
        }

        if (stations.isEmpty()) {
            String[] defaultNames = {
                "Amlarem", "Barengapara", "Byrnihat", "Damas_1", "Jowai", 
                "Khliehriat", "Latyrke", "Mairang", "Mawkyrwat_1", "Nongstoin_1", 
                "Panchiring", "Phulbari_1", "Rongjeng_1", "Saiden", "Shillong", 
                "Soksan", "Williamnagar", "Zikzak_1"
            };
            for (int i = 0; i < defaultNames.length; i++) {
                stations.add(new StationDto(i, defaultNames[i]));
            }
        }
        return stations;
    }

    private File resolveStationsFile() {
        File f1 = new File("ml-model/stations.json");
        if (f1.exists()) return f1;
        File f2 = new File("../ml-model/stations.json");
        if (f2.exists()) return f2;
        return null;
    }
}
