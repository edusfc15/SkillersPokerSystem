

import { HttpClient, HttpResponse } from "@angular/common/http";
import { Inject } from "@angular/core";


export class ImageService {

	constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {}
  
  
	public uploadImage(image: File) {
	  const formData = new FormData();
  
	  formData.append('image', image);

	  var url = this.baseUrl + 'api/player/PostImage' 
  
	  return this.http.post(url, formData);
	}
  }