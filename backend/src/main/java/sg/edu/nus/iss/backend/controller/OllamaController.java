package sg.edu.nus.iss.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.json.Json;
import sg.edu.nus.iss.backend.service.OllamaService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping(path="/api/ollama", 
        produces = MediaType.APPLICATION_JSON_VALUE)
public class OllamaController {
    
    @Autowired 
    private OllamaService ollamaService;

    @GetMapping
    public ResponseEntity<String> askOllama(
        @RequestParam(required=true) String question){

        try {
            String response = ollamaService.chatWithOllama(question);
            System.out.println(response);



            return ResponseEntity.ok(Json.createObjectBuilder()
                                .add("answer", response)
                                .build().toString());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Json.createObjectBuilder()
				.add("message", e.getMessage())
				.build().toString());
        } 


    }
}
