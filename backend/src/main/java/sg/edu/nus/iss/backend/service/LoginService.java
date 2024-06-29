package sg.edu.nus.iss.backend.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sg.edu.nus.iss.backend.model.User;
import sg.edu.nus.iss.backend.repo.LoginRepo;

@Service
public class LoginService {
    
    @Autowired
    LoginRepo loginRepo;

    public String signUp(User newuser) {

        String response = "Username is taken. Please pick another username.";
        
        //check username
        if(loginRepo.checkUsername(newuser)) {
            return response;
        }

        //generate token
        newuser.setToken(UUID.randomUUID().toString());

        //save
        int isSaved = loginRepo.signUp(newuser);

        if(isSaved == 0) {
            response = "Unable to insert user information into database. Please contact backend support";
        } else {
            response = "User signed up successfully";
        }

        return response;
    }

    public String getToken(User user) {

        return loginRepo.getToken(user);
    }

    public boolean checkToken(String token) {
        return loginRepo.checkToken(token);
    }

}
