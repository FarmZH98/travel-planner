package sg.edu.nus.iss.backend.model;

public class User {
    
    private String username;
    private String password;
    private String firstname;
    private String lastname;
    private String email;
    private String gender;
    private String token;

    public User(){

    }

    public User(String username, String password, String firstname, String lastname, String email, String gender) {
        this.username = username;
        this.password = password;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.gender = gender;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    @Override
    public String toString() {
        return "User [username=" + username + ", password=" + password + ", firstname=" + firstname + ", lastname="
                + lastname + ", email=" + email + ", gender=" + gender + ", token=" + token + "]";
    }

    

}
