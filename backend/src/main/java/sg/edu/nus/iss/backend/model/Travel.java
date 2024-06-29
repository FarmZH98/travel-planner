package sg.edu.nus.iss.backend.model;

import java.util.Date;
import java.util.List;

import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Travel {
    
    private String title;
    private Date startDate;
    private Date endDate;
    private String token;
    private List<String> places;
    //private List<Place> places;
    private String notes;
    private String id;

    public String toSummaryJsonString() {

        JsonObject taskAsJson = Json.createObjectBuilder()
        .add("id", id)
        .add("title", title)
        .add("startDate", startDate.toString())
        .add("endDate", endDate.toString())
        .add("token", token)
        .build();

        return taskAsJson.toString();

    }

    public String toJsonString() {

        JsonArray placesJson = convertListToJsonArray(places);

        JsonObject taskAsJson = Json.createObjectBuilder()
                        .add("id", id)
                        .add("title", title)
                        .add("startDate", startDate.toString())
                        .add("endDate", endDate.toString())
                        .add("token", token)
                        .add("notes", notes)
                        .add("places", placesJson)
                        .build();

        return taskAsJson.toString();
    }

    private JsonArray convertListToJsonArray(List<String> list) {
        JsonArrayBuilder arrayBuilder = Json.createArrayBuilder();

        for (String item : list) {
            arrayBuilder.add(item);
        }

        return arrayBuilder.build();
    }

}
