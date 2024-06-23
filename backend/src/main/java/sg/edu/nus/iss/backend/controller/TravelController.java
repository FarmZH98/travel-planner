package sg.edu.nus.iss.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/api/travel")
public class TravelController {
    
    @GetMapping()
    public ResponseEntity<String> getTravelDetails(@RequestHeader String token) {
    
        //check token

        //get travel details from MongoDB

        //return travel details + firstname

        return null;
    }
}
