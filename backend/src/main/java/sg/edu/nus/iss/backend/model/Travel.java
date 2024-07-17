package sg.edu.nus.iss.backend.model;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
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
    //private List<String> places;
    private List<Place> places;
    private String notes;
    private String id;

    public String getStartDateFormatted() {
        return dateFormatted(startDate);
    }

    public String getEndDateFormatted() {
        return dateFormatted(endDate);
    }

    private String dateFormatted(Date date) {
        Instant instant = date.toInstant();
        ZonedDateTime zonedDateTime = instant.atZone(ZoneId.of("GMT+08:00"));
        String formattedLocalDate = zonedDateTime.format(DateTimeFormatter.RFC_1123_DATE_TIME);

        return formattedLocalDate.replace(" 00:00:00 +0800", "");
    }

    public String toSummaryJsonString() {

        JsonObject taskAsJson = Json.createObjectBuilder()
        .add("id", id)
        .add("title", title)
        .add("startDate", getStartDateFormatted())
        .add("endDate",  getEndDateFormatted())
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

    private JsonArray convertListToJsonArray(List<Place> places) {
        JsonArrayBuilder arrayBuilder = Json.createArrayBuilder();

        for (Place place : places) {
            arrayBuilder.add(place.toJsonString());
        }

        return arrayBuilder.build();
    }

}
