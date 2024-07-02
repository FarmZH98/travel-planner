package sg.edu.nus.iss.backend.service;

import java.util.LinkedList;
import java.util.List;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sg.edu.nus.iss.backend.model.Travel;
import sg.edu.nus.iss.backend.repo.TravelRepo;

@Service
public class TravelService {
    
    @Autowired
    private TravelRepo travelRepo;

    public Travel saveTravel(Travel travel) {
        return travelRepo.save(travel);
    }

    public List<String> getAllTravels(String token) {
        
        List<String> tripsJson = new LinkedList<>();

        for(Document doc : travelRepo.getAllTravelsByToken(token)) {
            Travel travel = new Travel();
            travel.setTitle(doc.getString("title"));
            travel.setId(doc.getObjectId("_id").toHexString());
            travel.setToken(token);

            // Instant instant = Instant.parse(doc.getString("startDate"));
            // ZonedDateTime zonedDateTime = instant.atZone(ZoneId.systemDefault());
            // Date date = Date.from(zonedDateTime.toInstant());
            travel.setStartDate(doc.getDate("startDate"));

            // instant = Instant.parse(doc.getString("endDate"));
            // zonedDateTime = instant.atZone(ZoneId.systemDefault());
            // date = Date.from(zonedDateTime.toInstant());
            travel.setEndDate(doc.getDate("endDate"));
            System.out.println("getAllTravels()" + travel.toString());
            tripsJson.add(travel.toSummaryJsonString());
        }

        return tripsJson;
    }

    public Travel getTripDetailsById(String token, String id) {

        Document travelRaw = travelRepo.getTripById(token, id);
        Travel travel = new Travel();
        travel.setTitle(travelRaw.getString("title"));
        travel.setId(travelRaw.getObjectId("_id").toHexString());
        travel.setToken(token);
        travel.setNotes(travelRaw.getString("notes"));
        travel.setPlaces(travelRaw.getList("places", String.class));
        travel.setStartDate(travelRaw.getDate("startDate"));
        travel.setEndDate(travelRaw.getDate("endDate"));
        System.out.println(">>> getTripDetailsById()" + travel.toString());

        return travel;
        //return travel.toJsonString();
    }

    public void updateTravel(Travel travel) {
        travelRepo.update(travel);
    }

    public void deleteTravel(String token, String id) {
        travelRepo.delete(token,id);
    }

}
