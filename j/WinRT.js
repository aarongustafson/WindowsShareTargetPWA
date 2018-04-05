(function(window, document, Windows){

  $output.innerHTML += 'Loading the WinRT scripts\r\n';

  var App = Windows.UI.WebUI.WebUIApplication,
      ActivationKind = Windows.ApplicationModel.Activation.ActivationKind,
      StandardDataFormats = Windows.ApplicationModel.DataTransfer.StandardDataFormats,
      $images = document.createElement('div'),
      $image = document.createElement('img');
  
  document.body.appendChild($images);

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
                    var $img = $image.clone(true);
                    $img.src = obj.image_src;
                    $images.appendChild($image);
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
      var blobs = [];
        
      function readStorageItems( storageItems )
      {
        return Promise.all(storageItems.map(function (item) {
          // read the file
          return readFile(item);
        }));
      }

      function readFile(file)
      {
        var is_img = file.contentType.indexOf('image') > -1;
        return file.openReadAsync()
                .then(bitmapStream => { 
                  if (bitmapStream) { 
                    blob_url = URL.createObjectURL(bitmapStream, { oneTimeOnly: true });
                    if ( is_img )
                    {
                      var $img = $image.clone(true);
                      $img.src = blob_url;
                      $images.appendChild($image);
                    }
                  }
                  // update the array
                  blobs.push(blob_url);
                });
      }
      
      // get the storage items
      data.getStorageItemsAsync()
        // loop the storage items
        .then(storageItems => readStorageItems(storageItems))
        // then get the blob
        .then(() => {
          obj.files = blobs;
          $output.innerHTML += JSON.stringify(obj) + '\r\n';
        });

  }

  if ( 'ActivationEvent' in window )
  {
    activationHandler(window.ActivationEvent);
  }

}(this, this.document, this.Windows));