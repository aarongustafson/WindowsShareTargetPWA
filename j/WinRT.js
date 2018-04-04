(function(window, document, Windows){

  $output.innerHTML += 'Loading the WinRT scripts\r\n';

  var App = Windows.UI.WebUI.WebUIApplication,
      ActivationKind = Windows.ApplicationModel.Activation.ActivationKind,
      StandardDataFormats = Windows.ApplicationModel.DataTransfer.StandardDataFormats;
  
  function activationHandler( e )
  {
    $output.innerHTML += 'App activated\r\n';
    console.log( 'Activation Event', e );
    if ( e.kind == ActivationKind.shareTarget )
    {
      $output.innerHTML += 'Handling the share\r\n';
      shareHandler(e);
    }
  }

  function shareHandler( e )
  {
    var data = e.shareOperation.data,
        obj = {
          title: data.properties.title,
          description: data.properties.description
        };
    
    if (data.properties.contentSourceWebLink)
    { 
      obj.weblink = data.properties.contentSourceWebLink.rawUri;
      $output.innerHTML += JSON.stringify(obj) + '\r\n';
    }

    if (data.contains(StandardDataFormats.text))
    {
      $output.innerHTML += 'Handling the share\r\n';
      data.getTextAsync()
        .done(function (text) { 
            obj.text = text;
            $output.innerHTML += JSON.stringify(obj) + '\r\n';
          },
          function (e) { 
            $output.innerHTML += 'Error retrieving text data';
            console.log(e); 
          }); 
    }

    if (data.contains(StandardDataFormats.webLink))
    { 
      data.getWebLinkAsync()
        .done(function (webLink) { 
            obj.weblink = webLink.rawUri;
            $output.innerHTML += JSON.stringify(obj) + '\r\n';
          },
          function (e) { 
            $output.innerHTML += 'Error retrieving weblink data';
            console.log(e); 
          });
    } 
    
    if (data.contains(StandardDataFormats.bitmap))
    { 
      data.getBitmapAsync()
        .done(function (bitmapStreamReference) {
            bitmapStreamReference.openReadAsync()
              .done(function (bitmapStream) { 
                  if (bitmapStream) { 
                    obj.image_src = URL.createObjectURL(bitmapStream, { oneTimeOnly: true });
                    $output.innerHTML += JSON.stringify(obj) + '\r\n';
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

    if (data.contains(StandardDataFormats.storageItems))
    {
      data.getStorageItemsAsync()
        .then(function (storageItems) {
          var blobs = [];
          const files = storageItems.map(async (file) => {
              
            await file.openReadAsync()
                .done(bitmapStream => { 
                    console.log('bitmapStream',bitmapStream);
                    if (bitmapStream) { 
                        blob_url = URL.createObjectURL(bitmapStream, { oneTimeOnly: true });
                    }
                    console.log('blob_url', blob_url);
                    blobs.push(blob_url);
                });
          });

          Promise.all(files)
            .then(function(){
              obj.files = files;
              $output.innerHTML += JSON.stringify(obj) + '\r\n';
            });
        });

  }

  if ( 'ActivationEvent' in window )
  {
    activationHandler(window.ActivationEvent);
  }

}(this, this.document, this.Windows));