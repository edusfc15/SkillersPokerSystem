import { HttpClient, HttpResponse } from "@angular/common/http";
import { Inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";


export class ImageService {

	constructor(
		private http: HttpClient, 
		@Inject('BASE_URL') private baseUrl: string,
		private activatedRoute: ActivatedRoute,) {}
  
  
	public uploadImage(image: File) {
	  const formData = new FormData();
	  formData.append('image', image);

	  var tempPlayer = <Player>{};

	  tempPlayer.Id = +this.activatedRoute.snapshot.params["id"];
	  tempPlayer.Image = formData;
  

	  var url = this.baseUrl + 'api/player' 
  
	  return this.http.put<Player>(url, tempPlayer);

	}
  }