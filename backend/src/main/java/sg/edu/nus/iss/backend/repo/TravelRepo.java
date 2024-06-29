package sg.edu.nus.iss.backend.repo;

import java.util.List;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Repository;

import com.mongodb.client.result.UpdateResult;

import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import sg.edu.nus.iss.backend.model.Travel;
import sg.edu.nus.iss.backend.util.Util;

@Repository
public class TravelRepo {
    
    @Autowired
	private MongoTemplate mongoTemplate;

    public Travel save(Travel travel) {
		Travel response = mongoTemplate.save(travel, "trips");

		System.out.println(response.toString());

		return response;

	}

    public List<Document> getAllTravelsByToken(String token) {
     
        Criteria criteria = Criteria.where(Util.F_TOKEN).regex(token, "i");

        //create query with filter and sort and limit
        Query query = Query.query(criteria);

        //projection  {(name : 1, genres : 1)}
        query.fields().include(Util.F_TITLE, Util.F_STARTDATE, Util.F_ENDTDATE);

        List <Document> results = mongoTemplate.find(query, Document.class, Util.C_TRIPS);

        return results;
    }

    // db.trips.find({
    //     title: { $match: 'Singapore', $options: 'i'},
    //     _id: ObjectId("4ecbe7f9e8c1c9092c000027") 
    // })
    public Document getTripById(String token, String id) {
       
        Criteria criteria1 = Criteria.where(Util.F_TOKEN).is(token);
        Criteria criteria2 = Criteria.where("_id").is(new ObjectId(id));

        //create query with filter and sort and limit
        Query query = new Query();
        query.addCriteria(criteria1);
        query.addCriteria(criteria2);

        List <Document> results = mongoTemplate.find(query, Document.class, Util.C_TRIPS);

        return results.get(0);
    }

    public void update(Travel travel) {
        Query query = Query.query(Criteria.where("_id").is(travel.getId()));

        Update updateOperation = new Update()
                                    .set("title", travel.getTitle())
                                    .set("notes", travel.getNotes())
                                    .set("startDate", travel.getStartDate())
                                    .set("endDate", travel.getEndDate())
                                    .set("places", travel.getPlaces());

        UpdateResult result = mongoTemplate.updateMulti(query, updateOperation, Util.C_TRIPS);

        System.out.println(">>> result in update: " + result);

		//return response;

	}

    public void delete(String token, String id) {

        Criteria criteria1 = Criteria.where(Util.F_TOKEN).is(token);
        System.out.println("delete>>> :" + id);
        Criteria criteria2 = Criteria.where("_id").is(new ObjectId(id));

        //create query with filter and sort and limit
        Query query = new Query();
        query.addCriteria(criteria1);
        query.addCriteria(criteria2);

        mongoTemplate.remove(query, Document.class, Util.C_TRIPS);
    }

}
