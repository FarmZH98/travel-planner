package sg.edu.nus.iss.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import sg.edu.nus.iss.backend.model.User;
import sg.edu.nus.iss.backend.service.LoginService;

@Controller
@RequestMapping("/api")
public class LoginController {

    @Autowired
    LoginService loginService;
    
    //create a new token and store into database
    @PostMapping("/signup")
    public ResponseEntity<String> signUp(@RequestHeader String username, @RequestHeader String password, @RequestParam String firstname, @RequestParam String lastname, @RequestParam String gender, @RequestParam String email) {

        User newuser = new User(username, password, firstname, lastname, email, gender);

        String response = loginService.signUp(newuser);

        if(response.contains("Username is taken")) {
            return ResponseEntity.status(400).body(Json.createObjectBuilder()
            .add("message", response)
            .build().toString()); 
        } else if(response.contains("Please contact backend support")) {
            return ResponseEntity.status(400).body(Json.createObjectBuilder()
            .add("message", response)
            .build().toString()); 
        }

        return ResponseEntity.ok(
            Json.createObjectBuilder()
            .add("message", response)
            .build().toString());
    }

    //get token from database
    @GetMapping("/login")
    public ResponseEntity<String> login(@RequestHeader String username, @RequestHeader String password) {

        User user = new User();
        user.setUsername(username);
        user.setPassword(password);

        String response = loginService.getToken(user);

        if(response.contains("s")) {
            return ResponseEntity.status(400).body(Json.createObjectBuilder()
            .add("message", response)
            .build().toString()); 
        }

        return ResponseEntity.ok(
            Json.createObjectBuilder()
            .add("token", response)
            .build().toString());
    }
}
