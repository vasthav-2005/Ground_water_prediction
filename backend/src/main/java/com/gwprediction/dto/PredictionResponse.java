package com.gwprediction.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class PredictionResponse {

    private String status;

    @JsonProperty("predictedGwlMeter")
    @JsonAlias({"predicted_gwl_meter", "predicted_gwl", "predictedGwl"})
    private Double predictedGwlMeter;

    private String classification;

    private String station;

    @JsonProperty("stationCode")
    @JsonAlias({"station_code"})
    private Integer stationCode;

    private String unit;

    @JsonProperty("inputsEvaluated")
    @JsonAlias({"inputs_evaluated"})
    private Map<String, Object> inputsEvaluated;

    private Long timestamp;

    // Additional helper getter so JSON response exposes predicted_gwl_meter too if needed by JS
    @JsonProperty("predicted_gwl_meter")
    public Double getPredictedGwlMeterSnake() {
        return predictedGwlMeter;
    }
}
