package sg.edu.nus.iss.backend.model;

import java.io.StringReader;

import org.bson.Document;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Place {
    private String name;
    private double lat;
    private double lon;
    private String address;
    private String url;

     public String toJsonString() {

        JsonObject placeAsJson = Json.createObjectBuilder()
                        .add("name", name)
                        .add("lat", lat)
                        .add("lon", lon)
                        .add("address", address)
                        .add("url", url)
                        .build();

        return placeAsJson.toString();
    }

    public static Place jsonToPlace(String jsonPlace) {
        System.out.println(jsonPlace);
        JsonReader reader = Json.createReader(new StringReader(jsonPlace));
        JsonObject placeData = reader.readObject();

        Place place = new Place();
        place.setAddress(placeData.getString("address"));
        place.setLat((placeData.getJsonNumber("lat").doubleValue()));
        place.setLon(placeData.getJsonNumber("lon").doubleValue());
        place.setName(placeData.getString("name"));
        place.setUrl(placeData.getString("url"));

        return place;
    }

    public static Place documentToPlace(Document placeDocument) {
        Place place = new Place();
        place.setAddress(placeDocument.getString("address"));
        place.setLat((placeDocument.getDouble("lat")));
        place.setLon(placeDocument.getDouble("lon"));
        place.setName(placeDocument.getString("name"));
        place.setUrl(placeDocument.getString("url"));

        return place;
    }
}
