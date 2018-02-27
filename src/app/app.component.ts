import { Component ,ElementRef, ViewChild} from '@angular/core';
import {Http} from '@angular/http';

declare var google:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public zoom:number;
  public latitude :number;
  public longitude:number;
  public placeIdArray = [];
  public polylines = [];
  public snappedCoordinates = [];
  public apiKey:string = "AIzaSyBS_Eibb4Qw3w-IJ8McCvpg9uufnVpPjUY";

  @ViewChild("map")
  public map: ElementRef;
  constructor( private _elementRef : ElementRef, private http:Http) {}

  //init function for initialize all map data
  ngOnInit() {
    //set google maps defaults
     this.zoom = 4;
     this.latitude = 39.8282;
     this.longitude = -98.5795;
     //set current position
     var uluru = {lat: -35.28032, lng: 149.12907};
     this.map = new google.maps.Map(document.getElementById('map'), 
       {   zoom: 16,
           center: uluru
         }
     );
     this.setCurrentPosition();
     this.runSnapToRoad();
  }


  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
      });
    }
  }


  runSnapToRoad(){
    var pathValues = ['-35.27801,149.12958' , 
                      '-35.28032,149.12907',
                      '-35.28099,149.12929',
                      '-35.28144,149.12984',
                      '-35.28194,149.13003',
                      '-35.28282,149.12956',
                      '-35.28302,149.12881',
                      '-35.28473,149.12836'
    ];

    //create url for road api
    var param = pathValues.join("|");
    var url = "https://roads.googleapis.com/v1/snapToRoads?path=" + param + "&interpolate=true&key=" + this.apiKey;  

    console.log(url);

    // get snapshot data from api and draw lines
    this.getRoadApiData(url);
  }

      // Store snapped polyline returned by the snap-to-road service.
      processSnapToRoadResponse(data) {
        console.log(data);
        this.snappedCoordinates = [];
        data = data.snappedPoints;
        this.placeIdArray = [];
        for (var i = 0; i < data.length; i++) {
          var latlng = new google.maps.LatLng(
              data[i].location.latitude,
              data[i].location.longitude);
          this.snappedCoordinates.push(latlng);
          this.placeIdArray.push(data[i].placeId);
        }
      }
      
      getRoadApiData(url){
        this.http.get(url).subscribe(res => {
          console.log(res.text());
          var resData = JSON.parse(res.text());
          this.processSnapToRoadResponse(resData);
          this.drawSnappedPolyline();
        },err=> console.log(err));
      }
  
      // Draws the snapped polyline (after processing snap-to-road response).
      drawSnappedPolyline() {
        var snappedPolyline = new google.maps.Polyline({
          path: this.snappedCoordinates,
          strokeColor: 'black',
          strokeWeight: 6
        });
        snappedPolyline.setMap(this.map);
        this.polylines.push(snappedPolyline);
      }
  
}
