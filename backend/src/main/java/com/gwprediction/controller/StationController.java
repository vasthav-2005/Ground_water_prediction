package com.gwprediction.controller;

import com.gwprediction.dto.StationDto;
import com.gwprediction.service.PredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class StationController {

    private final PredictionService predictionService;

    @Autowired
    public StationController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @GetMapping("/stations")
    public ResponseEntity<List<StationDto>> getStations() {
        List<StationDto> stations = predictionService.getAvailableStations();
        return ResponseEntity.ok(stations);
    }
}
