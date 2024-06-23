package sg.edu.nus.iss.backend.repo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import sg.edu.nus.iss.backend.model.User;

@Repository
public class LoginRepo implements LoginQueries {
    
    @Autowired
    JdbcTemplate jdbcTemplate; 

    public int signUp(User newUser) {
        int insertResult = 0;

        insertResult = jdbcTemplate.update(INSERT_USER, newUser.getUsername(), newUser.getPassword(), newUser.getEmail(), newUser.getFirstname(), newUser.getLastname(), newUser.getGender(), newUser.getToken());

        return insertResult;
    }

    public boolean checkUsername(User newUser) {

        final SqlRowSet rs = jdbcTemplate.queryForRowSet(CHECK_USERNAME, newUser.getUsername());

        while (rs.next()) {
            return true;
        }

        return false;
    }

    public String getToken(User user) {
        final SqlRowSet rs = jdbcTemplate.queryForRowSet(GET_TOKEN, user.getUsername(), user.getPassword());

        while (rs.next()) {
            return rs.getString("token");
        }

        return "The given username and password do not match. Please try again";
    }
}
