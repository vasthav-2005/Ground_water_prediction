package com.gwprediction.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionRequest {

    @NotBlank(message = "Station name is required")
    private String station;

    private Integer stationCode;

    @NotNull(message = "Month is required")
    @Min(value = 1, message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    private Integer month;

    // Optional fields (defaults filled by backend if omitted)
    private Integer year;
    private Integer day;
    private Integer hour;
    private Integer dayOfYear;
    private Double gwlLag1;
    private Double gwlLag2;
    private Double gwlLag4;
    private Double gwlDiff1;
    private Double gwlRollMean24h;
    private Double gwlRollMean48h;
    private Double gwlRollStd24h;
}
