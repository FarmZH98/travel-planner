package sg.edu.nus.iss.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import sg.edu.nus.iss.backend.model.EmailInfo;
import sg.edu.nus.iss.backend.model.Travel;
import sg.edu.nus.iss.backend.model.User;


@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private SpringTemplateEngine templateEngine;

    @Autowired
    private TravelService travelService;
    
    @Autowired
    private LoginService loginService;

    @Value("${spring.mail.username}")
   private String emailSender;

    public String sendEmail(String token, EmailInfo emailInfo) throws MessagingException {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        User user = loginService.getUserDetails(token);

        Travel travel = travelService.getTripDetailsById(token, emailInfo.getTripId());

        Context context = new Context();
        context.setVariable("name", user.getFirstname() + " " + user.getLastname());
        context.setVariable("title", travel.getTitle());
        context.setVariable("notes", travel.getNotes());
        context.setVariable("places", travel.getPlaces());
        context.setVariable("startDate", travel.getStartDateFormatted());
        context.setVariable("endDate", travel.getEndDateFormatted());
        context.setVariable("placesDetail", emailInfo.getPlacesEmail());
        context.setVariable("transportMode", emailInfo.getTransportMode());

        String htmlContent = templateEngine.process("emailTemplate", context);

        helper.setTo(user.getEmail());
        helper.setSubject("Travela - " + travel.getTitle());
        helper.setText(htmlContent, true);
        helper.setFrom(emailSender);
        
        mailSender.send(message);

        return "Email sent successfully to " + user.getEmail();
    }

    // private List<Route> convertToRoute(String routesJson) {


    // }
}
