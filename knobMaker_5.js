// Miles DeCoster - codeforartists.com
// MakeKnob function to create rotating knobs which return different number ranges
// Version 5.0 July 2020

// 5.0
// Define mouse movement employed more clearly with parameter moveRange. 
// This determines the mouse move distance in pixels used to generate return values.
// Set with instancename.moveRange. Default is 280. To get the full and complete range of return values
// moveRange should equal the number of return values desired. Example: to return range of -50 to +50 you need 100 values.
// Example: to return range from 0.00 to 1.00 you also need 100 values.
// Add SHIFT/Click/Drag to allow for 10x fine-tune knob value You can change the fine tune value 
// using instancename.finetune = some number -- default is 10
// If cursor is OVER knob and NOT clicked, UP and DOWN ARROWS will increment knob value and rotate knob (see NOTES below)
// 
// 4.2.1
// Added displayValue update to update method
// 4.2
// Added textColor and textPt properties. (textPt is type size) defauts are 18 and black
// These properties are not initialized in the MakeButton function but may be set for 
// individual instances via instanceName.textColor and instanceName.textPt
// To hide labels set .textColor to [0,0,0,0] - this gives them 0 opacity

// These are the 9 parameters that need to be passed to the MakeKnob function:

// imgSrc - Set the image source in the first parameter. example: "knob.png" or "images/knob.png"
// diameter - Set knob size. Just a number (but refers to pixels)
// locx, locy - Set the location on the canvas horizontal and vertical pixel coordinates.
// lowNum, hiNum - Set the range of values returned. Floating point numbers.
// defaultNum - Sets the default value of the knob. DO NOT SET OR ALLOW A FREQUENCY TO BE SET TO 0 (ZERO). Amplitude can be 0.
// numPlaces - Refers to the displayed value below the knob. Sets the number of decimal places to display. 
//  - This does not affect the actual return values
// label - the text to display below the knob. example: "Frequency"

// NOTES:
// To retrieve the current value use instanceName.knobValue. This is how you access the returned value 
// and use it to actually do something.
// Example: myfreq = freqKnob.knobValue; osc.freq(myfreq);
// Each instance knob also needs to be attached to mouse actions with the active and inactive methods:
// example:
// function mousePressed() {
//    instancename.active();
// }
// function mouseReleased() {
//    instancename.inactive();
// }
// If you want to use the ARROW keys also add:
// function keyPressed() {
//    instancename.keypressed();
// }
// ------------------------------------------------------

function MakeKnob(imgSrc, diameter, locx, locy, lowNum, hiNum, defaultNum, numPlaces) {
  this.pos = createVector(0,0);
  this.pos.x = locx;
  this.pos.y = locy;
  this.lowNum = lowNum;
  this.hiNum = hiNum;
  this.rotateMe = map(defaultNum, lowNum, hiNum, 0, -280);
  this.currentRot = map(defaultNum, lowNum, hiNum, 0, -280);
  this.currentValue = defaultNum; 
  this.diameter = diameter;
  this.knobValue = defaultNum;
  this.displayValue=0;
  this.isClickedOn = false;
  this.mouseOver = false;
  this.myY=mouseY;
//  this.label=label;
  this.numPlaces = numPlaces;
  this.img = loadImage(imgSrc);
  this.moveRange = 280;
  this.fineTune = 10;
//  this.textColor = [0,0,0];
//  this.textPt = 18;
  
  // the update function will be called in the main program draw function
  this.update = function() {
    push(); // store the coordinate matrix ------------------------------------
    
    // move the origin to the pivot point
    translate(this.pos.x, this.pos.y);

    // rotate the grid around the pivot point by a
    // number of degrees based on click and drag on button
  
    //  Check if mouse is over the knob
    if (dist(this.pos.x, this.pos.y, mouseX, mouseY) < this.diameter/2) {
      this.mouseOver = true;
      cursor("pointer");
    } else {
      this.mouseOver = false;
    }
    
    //if (!mouseIsPressed && !this.mouseOver) {
    //  cursor('default');
    //}
    
    //-------------------------------- SET ROTATION AND RETURN VALUE------------------------
   
    if (mouseIsPressed && this.isClickedOn) { // && this.rotateMe >= -280 && this.rotateMe <= 0
 
      // check to see if SHIFT key is down and adjust range if it is
      if (keyIsPressed && keyCode==SHIFT) {
        this.rotateMe=this.currentRot+map(mouseY, this.myY, this.myY-this.moveRange, 0, -this.fineTune);
        if (this.rotateMe <  -280) { this.rotateMe = -280; }
        if (this.rotateMe > 0) { this.rotateMe = 0; }
        this.knobValue=map(this.rotateMe, 0, -280, this.lowNum, this.hiNum);
        // this.rotateMe=int(this.rotateMe);
      } else {
        this.rotateMe=this.currentRot+map(mouseY, this.myY, this.myY-this.moveRange, 0, -280);
        this.rotateMe=int(this.rotateMe);
        if (this.rotateMe <  -280) { this.rotateMe = -280; }
        if (this.rotateMe > 0) { this.rotateMe = 0; }
        this.knobValue=map(this.rotateMe, 0, -280, this.lowNum, this.hiNum);
      }

      rotate(radians(-this.rotateMe));   // change degrees to radians
    } else {
      rotate(radians(-this.rotateMe));
    }
  
    if (!mouseIsPressed ) {
      //this.currentRot=this.rotateMe;
      this.isClickedOn = false;
    } 
    // ----------------------------------------------DRAW KNOB  ----------------------------
    imageMode(CENTER);
    image(this.img,0,0,this.diameter,this.diameter);
    pop(); // restore coordinate matrix
  
    rotate(0);
  
   // add the display value and label
//    textAlign(CENTER);
//    textSize(this.textPt);
//    fill(this.textColor);
//    this.displayValue = nfc(this.knobValue, this.numPlaces); // added in version 4.2.1
//    if (this.displayValue == -0) { this.displayValue = 0; }
//    text(this.displayValue, this.pos.x, this.pos.y+this.diameter/2+15+this.textPt); // display value 
    
//    fill(this.textColor);
//    text(this.label, this.pos.x, this.pos.y+this.diameter/2+20+2.4*this.textPt);
    // set the cursor
    if (this.mouseOver || this.isClickedOn) { pointerCursor = true; }
  }; 
  
  
  // -----------------------------------------------------------
  
  this.active = function() {
    if (this.mouseOver){
      this.isClickedOn = true; 
      this.myY=mouseY;  
      cursor('pointer');
    } else {
      this.isClickedOn = false;
    }
  };
  
  this.inactive = function() {
    this.currentRot=this.rotateMe;
    this.isClickedOn = false;
    cursor('default');
  };
  this.keypressed = function() {
    if (this.mouseOver && this.currentRot <= 0 && this.currentRot >= -280 && keyCode === UP_ARROW) {
      this.currentRot-=280/this.moveRange;
      if (this.currentRot < -280) { this.currentRot = -280; }
      this.rotateMe=this.currentRot;
      this.knobValue=map(this.rotateMe, 0, -280, this.lowNum, this.hiNum);
    }
    if (this.mouseOver && this.currentRot >= -280 && this.currentRot <= 0 && keyCode === DOWN_ARROW) {
      //alert(this.currentRot);
      this.currentRot+=280/this.moveRange;
      if (this.currentRot > 0) { this.currentRot = 0; }
      this.rotateMe=this.currentRot;
      this.knobValue=map(this.rotateMe, 0, -280, this.lowNum, this.hiNum);
    }
  };

} // end KnobMaker
