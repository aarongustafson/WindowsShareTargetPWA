(function(window, document, Windows){

  $output.innerHTML += 'Getting the dataTransferManager\r\n';
  var app = Windows.UI.WebUI.WebUIApplication;
  // var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
  // app.addEventListener("sharetargetactivated", shareHandler);
  app.addEventListener("activated", function(){
    $output.innerHTML += 'activated event handled\r\n';
    app.addEventListener("shareactivated", shareHandler);
    $output.innerHTML += 'shareactivated event handled\r\n';
  });
  
  
  function shareHandler(e) {
    $output.innerHTML += 'Handling the share\r\n';
    console.log(e);
    var data = e.request.data,
        obj = {
          title: data.properties.title,
          description: data.properties.description
        };
    
    if (shareOperation.data.properties.contentSourceWebLink)
    { 
      obj.contentSourceWebLink = data.properties.contentSourceWebLink.rawUri;
    }

    if (data.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text))
    {
      data.getTextAsync()
        .done(function (text) { 
            obj.content = text; 
          },
          function (e) { 
            $output.innerHTML += 'Error retrieving text data';
            console.log(e); 
          }); 
    }
    if (data.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink))
    { 
      data.getWebLinkAsync()
        .done(function (webLink) { 
            obj.weblink = webLink.rawUri;
          },
          function (e) { 
            $output.innerHTML += 'Error retrieving weblink data';
            console.log(e); 
          });
    } 
    
    if (data.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap))
    { 
      data.getBitmapAsync()
        .done(function (bitmapStreamReference) {
            bitmapStreamReference.openReadAsync()
              .done(function (bitmapStream) { 
                  if (bitmapStream) { 
                    obj.image_src = URL.createObjectURL(bitmapStream, { oneTimeOnly: true });
                  } 
                },
                function (e) { 
                  $output.innerHTML += 'Error reading image stream';
                  console.log(e); 
                }); 
          },
          function (e) { 
            $output.innerHTML += 'Error retrieving image data';
            console.log(e);
          }); 
    }
    
    console.log(obj);
  }

}(this, this.document, this.Windows));