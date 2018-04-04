(function(window, document, Windows){

  var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
  dataTransferManager.addEventListener("datarequested", shareHandler);
  
  function shareHandler(e) {
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