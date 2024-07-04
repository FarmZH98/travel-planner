import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OllamaService {

    private readonly httpClient = inject(HttpClient)
    chatWithOllama(question: string) {
        question = question.trim();
        const params = new HttpParams().set('question', question) 
      
        
        return lastValueFrom(this.httpClient.get<Object>('/api/ollama', { params }))
    }
  }