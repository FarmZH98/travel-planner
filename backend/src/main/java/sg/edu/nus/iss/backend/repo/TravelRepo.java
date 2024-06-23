package sg.edu.nus.iss.backend.repo;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Repository;

import sg.edu.nus.iss.backend.model.Travel;

@Repository
public class TravelRepo {
    
    @Autowired
	MongoTemplate mongoTemplate;

    public Travel save(Travel travel) {
		// IMPORTANT: Write the native mongo query in the comments above this method
		Travel response = mongoTemplate.save(travel, "trips");

		System.out.println(response.toString());

		return response;

	}

    public List<Travel> getAllTravelsByToken(String token) {
        //yet to do        
        
        return null;
    }
}
