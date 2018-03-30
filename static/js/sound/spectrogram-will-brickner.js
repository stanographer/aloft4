var selectionVisible = true,
    useMicrophone = null,
    source,
    
    canvasElement = document.getElementById('spectrogram'),
    canvasContext = canvasElement.getContext('2d'),
    uploader      = document.getElementById('up'),
    
    uploadSelect  = document.getElementById('uploadSelection'),
    micSelect     = document.getElementById('micSelection'),
    
    errUpload     = document.getElementById('err-upload'),
    
    bufferLength,
    eightBufferLength,
    dataArray,
    imageDataFrame,
    
    _o = 0,
    x = 0,
    WIDTH = canvasElement.width,
    ApiSupport = true;
    
// create the WebAudioApi 
try
{
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.smoothingTimeConstant = 0.0;
}
catch(e)
{
    console.log('Web Audio API is not supported in this browser');
    ApiSupport = false;
}

if(ApiSupport)
{
    // setup the analyser and dataArray early
    analyser.fftSize = 1024;
    bufferLength = analyser.frequencyBinCount;
    eightBufferLength = 8 * bufferLength + 1;
    dataArray = new Uint8Array(bufferLength);
    
    // setup the getUserMedia early
    navigator.getUserMedia = (navigator.getUserMedia        ||
                              navigator.webkitGetUserMedia  ||
                              navigator.mozGetUserMedia     ||
                              navigator.msGetUserMedia);
                              
    // setup the imageDataFrame early
    imageDataFrame = canvasContext.createImageData(2, canvasElement.height);
    
    for(var index = 0; index < imageDataFrame.data.length * 4; index += 8)
    {
        imageDataFrame.data[index    ]
        imageDataFrame.data[index + 6] = 0;
        imageDataFrame.data[index + 3] = 
        imageDataFrame.data[index + 4] =
        imageDataFrame.data[index + 5] = 
        imageDataFrame.data[index + 7] = 255;
    }  
    
    document.getElementById("micSelection").addEventListener("click", function()
    {
        console.log("mic clicked");
    
        useMicrophone = true;
        handleSelection();
    });

} else
{
    // tell the user their browser is shit
}

function handleSelection()
{
    if(useMicrophone)
    {       // code to handle the mic
        console.log('mic enabled');
        
        if (navigator.getUserMedia)
        {
            console.log('getUserMedia supported');
            
            navigator.getUserMedia(
                {
                    audio: true,
                    video: false
                },
                
                // permission granted!
                function(stream)
                {
                    source = audioContext.createMediaStreamSource(stream);
                    source.connect(analyser);
                    
                    // display the canvas because we can now use it!
                    canvasElement.style.display = 'block';
                    
                    // start drawing
                    draw();
                },
                
                // permission denied! :(
                function(error)
                {
                    console.log('permission denied, or an error!');
                    console.log('that error is:');
                    //                     console.log(error);
                    if(error.name == "DevicesNotFoundError")
                    {
                        // tell the user a mic could not be found...
                        console.log('no device found');
                        alert("No microphone was detected!")
                    }
                    else
                    {
                        console.log(error);
                    }
                }
            );
        } else
        {
            console.log('getUserMedia causing an error');
        }
    }
    else    // code to handle the uploading
    {
        console.log('upload enabled, bufferSource created.');
        
        // assign the global variable 'source' as a new BufferSource
        source = audioContext.createBufferSource();
        
        uploader.click();
//         uploader.style.display = 'block';
        
        uploader.addEventListener('change', function()
        {
            // this way if the user cancels the file upload the buttons will still be there
            uploadSelect.style.display = 'none';
            micSelect.style.display = 'none';
            
            var reader = new FileReader();
            
            reader.onload = function(ev) {
                audioContext.decodeAudioData(ev.target.result, function(_buffer) {
                    source.buffer = _buffer;
                    source.connect(analyser);
                    source.connect(audioContext.destination);
                    source.start(0);
                    
                    
                    // hide the uploader, 
                    // actually the uploader doesn't need to be hidden, because it's never shown.
//                  uploader.style.display = 'none';
                    // show the canvas
                    canvasElement.style.display = 'block';
                    
                    // start drawing!
                    draw();
                },
                
                // if there is an error understanding the file
                function(err)
                {
                    errUpload.style.display = 'block';
                    document.getElementById('err-ok').style.display = 'block';
                    document.body.style.backgroundColor = '#ffb6b6' /* '#FF9494' */;
//                  document.html.style.backgroundColor = '#ff0000';
                });
            };
            
            reader.readAsArrayBuffer(this.files[0]);
        }, false);
    }
}

function draw()
{
/*     drawVisual =  */requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    
//     for(var index = bufferLength, _o = 0; index > 0; --index, _o += 8)
    for(var index = 0, _o = eightBufferLength; index < bufferLength; ++index, _o -= 8)
    {
        imageDataFrame.data[_o    ] =
        imageDataFrame.data[_o + 1] = dataArray[index];
        // increment by 8, as to not interfere with the playhead (second coloumn of pixels at x=1)
    }
    
    canvasContext.putImageData(imageDataFrame, x, 0);
    
    if(x < WIDTH) {
        x++;
    } else {
        x = 0;
    }
}
