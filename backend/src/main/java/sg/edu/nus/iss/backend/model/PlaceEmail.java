package sg.edu.nus.iss.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PlaceEmail {
    
    private String weather;
    private String weatherCity;
    private String weatherIcon;
    private String dist;
    private String duration;

}
