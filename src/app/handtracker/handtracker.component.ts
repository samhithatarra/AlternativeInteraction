import { Component, ElementRef, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import * as handTrack from 'handtrackjs';
import { PredictionEvent } from '../prediction-event';

@Component({
  selector: 'app-handtracker',
  templateUrl: './handtracker.component.html',
  styleUrls: ['./handtracker.component.css']
})
export class HandtrackerComponent implements OnInit {
  @Output() onPrediction = new EventEmitter<PredictionEvent>();
  @ViewChild('htvideo') video: ElementRef;
  
  /* 
  SAMPLERATE determines the rate at which detection occurs (in milliseconds)
  500, or one half second is about right, but feel free to experiment with faster
  or slower rates
  */
  SAMPLERATE: number = 500; 
  
  detectedGesture:string = "None"
  width:string = "400"
  height:string = "400"

  private model: any = null;
  private runInterval: any = null;


  //handTracker model
  private modelParams = {
    flipHorizontal: true, // flip e.g for video
    maxNumBoxes: 20, // maximum number of boxes to detect
    iouThreshold: 0.5, // ioU threshold for non-max suppression
    scoreThreshold: 0.6, // confidence threshold for predictions.
  };

  constructor() {
  }
  
  ngOnInit(): void{
    handTrack.load(this.modelParams).then((lmodel: any) =>{
        this.model = lmodel;
        console.log("loaded");
    });
  }

  ngOnDestroy(): void{
      this.model.dispose();
  }

  startVideo(): Promise<any> {
    return handTrack.startVideo(this.video.nativeElement).then(function(status: any){
        return status;
    }, (err: any) => { return err; }) 
  }

  startDetection(){
    this.startVideo().then(()=>{
        //The default size set in the library is 20px. Change here or use styling
        //to hide if video is not desired in UI.
        this.video.nativeElement.style.height = "200px"

        console.log("starting predictions");
        this.runInterval = setInterval(()=>{
            this.runDetection();
        }, this.SAMPLERATE);
    }, (err: any) => { console.log(err); });
  }

  stopDetection(){
    console.log("stopping predictions");
    clearInterval(this.runInterval);
    handTrack.stopVideo(this.video.nativeElement);
  }


 

  /*
    runDetection demonstrates how to capture predictions from the handTrack library.
    It is not feature complete! Feel free to change/modify/delete whatever you need
    to meet your desired set of interactions
  */
  runDetection(){
    if (this.model != null){
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundSize = "cover";
      
        let predictions = this.model.detect(this.video.nativeElement).then((predictions: any) => {
            if (predictions.length <= 0) return;
            
            let openhands = 0;
            let closedhands = 0;
            let pointing = 0;
            let pinching = 0;
            
            for(let p of predictions){
                //uncomment to view label and position data
                console.log(p.label + " at X: " + p.bbox[0] + ", Y: " + p.bbox[1] + " at X: " + p.bbox[2] + ", Y: " + p.bbox[3]);
                
                if(p.label == 'open') openhands++;
                if(p.label == 'closed') closedhands++;
                if(p.label == 'point') pointing++;
                if(p.label == 'pinch') pinching++;
                
            }

            // These are just a few options! What about one hand open and one hand closed!?

            if (openhands > 1) this.detectedGesture = "Two Open Hands";
            else if(openhands == 1) this.detectedGesture = "Open Hand";
            
            if (closedhands > 1) this.detectedGesture = "Two Closed Hands";
            else if(closedhands == 1) this.detectedGesture = "Closed Hand";
            
            if (pointing > 1) this.detectedGesture = "Two Hands Pointing";
            else if(pointing == 1) this.detectedGesture = "Hand Pointing";
            
            if (pinching > 1) this.detectedGesture = "Two Hands Pinching";
            else if(pinching == 1) this.detectedGesture = "Hand Pinching";

            // Added custom gesture #1: one hand open / one hand closed
            if (pinching == 1 && openhands == 1) this.detectedGesture = "Open Hand and Closed Hand";
            // if (closedhands == 1 && openhands == 1) 

            // Added custom gesture #2: one hand open / one hand pointing
            if (pointing == 1 && openhands == 1) this.detectedGesture = "Open Hand and Pointing";


            // Background change
            if (closedhands > 1) document.body.style.backgroundImage = "url('https://cdn.discordapp.com/attachments/826616753433215006/916824110267506698/rz4WAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQmIiAEoATwdXQQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJC4GoEfgDP2EbzJvCl7wAAAABJRU5ErkJggg.png')";
            if (openhands > 1) document.body.style.backgroundImage = "url('https://cdn.discordapp.com/attachments/826616753433215006/916825432857387018/mlMApgVMCpwROCZwSOCVwSuCUwCmBUwKnBE4JnBI4JXBK4JTAKYFfI4EfrgD8Nd08vWUwCmBUwKnBE4JnBI4JXBK4JTAKYFTAqcETgmcEjglcErglMApgXck8G88GvGQpLMnUAAAAABJRU5ErkJggg.png')";
            if (openhands == 1) document.body.style.backgroundImage = "url('https://cdn.discordapp.com/attachments/826616753433215006/916824688850784266/Sm8AAAAASUVORK5CYII.png')";
            if (pointing == 1) document.body.style.backgroundImage = "url('https://cdn.discordapp.com/attachments/826616753433215006/916825874794422342/saD7wnAfiOlmzv2CSwSWCTwCaBTQKbBDYJbBLYJLBJYJPAJoFNApsENglsEtgksEng7RLYEoBvFn2wk0CmwQ2CWwS2CSwSWCTwCaBTQKbBDYJbBLYJLBJYJPAJoFNArPBP4fSnF3pyqhbqMAAAAASUVORK5CYII.png')";
            if (pointing >1) document.body.style.backgroundImage = "url('https://cdn.discordapp.com/attachments/826616753433215006/916826109289578516/HIUeCQAfznaPu78oMCDAg8KPCjwoMCDAg8KPCjwoMCDAg8KPCjwoMCDAg8KPCjwoMDvnQKPBODvfQseC3hQ4EGBBwUeFHhQ4EGBBwUeFHhQ4EGBBwUeFHhQ4EGBBwUeFHhQ4JejwP8HaNeNOQSCXDQAAAAASUVORK5CYII.png')";
            if (pinching == 1) document.body.style.backgroundImage = "url('https://cdn.discordapp.com/attachments/826616753433215006/916826322469269575/AUiSgmpiKVaAAAAAElFTkSuQmCC.png')";
            if (pinching > 1) document.body.style.backgroundImage = "url('https://cdn.discordapp.com/attachments/826616753433215006/916825163998322739/9ICfwo5StGj8sLGLwAAAABJRU5ErkJggg.png')";
            if (pinching == 1 && openhands == 1) document.body.style.backgroundImage = "url('https://cdn.discordapp.com/attachments/826616753433215006/916825662319394896/AQvrDTC2hgW8AAAAAElFTkSuQmCC.png')";
            if (pointing == 1 && openhands == 1) document.body.style.backgroundImage = "url('https://cdn.discordapp.com/attachments/826616753433215006/916824497032675338/vYAAAAASUVORK5CYII.png')";
            


            if (openhands == 0 && closedhands == 0 && pointing == 0 && pinching == 0)
                this.detectedGesture = "None", document.body.style.backgroundImage = "url('https://cdn.discordapp.com/attachments/826616753433215006/916823576210989126/SurHmAAAAAElFTkSuQmCC.png')";

          


            this.onPrediction.emit(new PredictionEvent(this.detectedGesture))
        }, (err: any) => {
            console.log("ERROR")
            console.log(err)
        });
    }else{
        console.log("no model")
    }
  }
}