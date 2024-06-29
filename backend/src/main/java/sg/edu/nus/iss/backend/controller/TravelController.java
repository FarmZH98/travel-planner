package sg.edu.nus.iss.backend.controller;

import java.io.ByteArrayInputStream;
import java.io.StringReader;
import java.text.DateFormat;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import sg.edu.nus.iss.backend.model.Travel;
import sg.edu.nus.iss.backend.service.LoginService;
import sg.edu.nus.iss.backend.service.TravelService;
import sg.edu.nus.iss.backend.util.Util;

@Controller
@RequestMapping("/api/travel")
public class TravelController {

    @Autowired
    private LoginService loginService;

    @Autowired
    private TravelService travelService;
    
    @GetMapping("/summary")
    public ResponseEntity<String> getTravelSummary(@RequestHeader String token) {
    
        //check token
        if(!loginService.checkToken(token)) {
            return ResponseEntity.status(401).body(Json.createObjectBuilder()
            .add("message", Util.NO_TOKEN_RESPONSE)
            .build().toString());
        }

        try {
            //get travel details from MongoDB
            List<String> trips = travelService.getAllTravels(token);
            JsonArray result = Json.createArrayBuilder(trips).build();
            
            //return travel details + firstname
            return ResponseEntity.ok(
                        Json.createObjectBuilder()
                        .add("travels", result)
                        .build().toString());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Json.createObjectBuilder()
				.add("message", e.getMessage())
				.build().toString());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<String> getTravelDetail(@RequestHeader String token, @PathVariable String id) {
    
        //check token
        if(!loginService.checkToken(token)) {
            return ResponseEntity.status(401).body(Json.createObjectBuilder()
            .add("message", Util.NO_TOKEN_RESPONSE)
            .build().toString());
        }

        try {
            //get travel details from MongoDB
            String result = travelService.getTripDetailsById(token, id);
            System.out.println(">>> result Json:" + result);
            
            //return travel details + firstname
            return ResponseEntity.ok(
                        Json.createObjectBuilder()
                        .add("trip", result)
                        .build().toString());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Json.createObjectBuilder()
				.add("message", e.getMessage())
				.build().toString());
        }
    }


    @PostMapping()
    public ResponseEntity<String> createTravel(@RequestHeader String token, @RequestBody String payload) {

        try {
            //check token
            if(!loginService.checkToken(token)) {
                return ResponseEntity.status(401).body(Json.createObjectBuilder()
                .add("message", Util.NO_TOKEN_RESPONSE)
                .build().toString());
            }

            //create travel object from payload
            Travel travel = convertPayloadToTravel(token, payload);

            Travel savedTravel = travelService.saveTravel(travel);

            return ResponseEntity.ok(
                    Json.createObjectBuilder()
                    .add("id", savedTravel.getId())
                    .build().toString());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Json.createObjectBuilder()
				.add("message", e.getMessage())
				.build().toString());
        }
    }

    @PostMapping("/update")
    public ResponseEntity<String> updateTravel(@RequestHeader String token, @RequestBody String payload) {

        if(!loginService.checkToken(token)) {
            return ResponseEntity.status(401).body(Json.createObjectBuilder()
            .add("message", Util.NO_TOKEN_RESPONSE)
            .build().toString());
        }

        try {
            //convert payload to travel
            Travel travel = convertPayloadToTravel(token, payload);

            travelService.updateTravel(travel);
            
            //return travel details + firstname
            return ResponseEntity.ok(
                        Json.createObjectBuilder()
                        .build().toString());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Json.createObjectBuilder()
				.add("message", e.getMessage())
				.build().toString());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTravel(@RequestHeader String token, @PathVariable String id) {

        if(!loginService.checkToken(token)) {
            return ResponseEntity.status(401).body(Json.createObjectBuilder()
            .add("message", Util.NO_TOKEN_RESPONSE)
            .build().toString());
        }

        try {
            System.out.println(">>>deleteTravel(): token - " + token + ". ID: " + id);
            travelService.deleteTravel(token, id);
            
            //return travel details + firstname
            return ResponseEntity.ok(
                        Json.createObjectBuilder()
                        .build().toString());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Json.createObjectBuilder()
				.add("message", e.getMessage())
				.build().toString());
        }
    }

    private Travel convertPayloadToTravel(String token, String payload) {
        JsonReader reader = Json.createReader(new StringReader(payload));
        JsonObject data = reader.readObject();
        
        Travel travel = new Travel();

        Instant instant = Instant.parse(data.getString("startdate"));
        ZonedDateTime zonedDateTime = instant.atZone(ZoneId.systemDefault());
        Date date = Date.from(zonedDateTime.toInstant());

        travel.setStartDate(date);

        instant = Instant.parse(data.getString("enddate"));
        zonedDateTime = instant.atZone(ZoneId.systemDefault());
        date = Date.from(zonedDateTime.toInstant());

        travel.setEndDate(date);
        travel.setNotes(data.getString("notes"));
        travel.setTitle(data.getString("title"));
        travel.setPlaces(data.getJsonArray("places").stream()
                                .map(value -> value.toString().replace("\"", ""))
                                .toList());
        travel.setToken(token);

        if(data.containsKey("id")) {
            travel.setId(data.getString("id"));
        }
        
        System.out.printf(">>> Travel: %s\n", travel.toString());

        return travel;
    }
}
