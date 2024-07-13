package sg.edu.nus.iss.backend.model;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailInfo {
    private String tripId;
    private String transportMode;
    private List<PlaceEmail> placesEmail;
    
}
