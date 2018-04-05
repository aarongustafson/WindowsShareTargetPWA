(function(window, document, Windows){

  $output.innerHTML += 'Loading the WinRT scripts\r\n';

  var App = Windows.UI.WebUI.WebUIApplication,
      ActivationKind = Windows.ApplicationModel.Activation.ActivationKind,
      StandardDataFormats = Windows.ApplicationModel.DataTransfer.StandardDataFormats,
      $images = document.createElement('div'),
      $image = document.createElement('img'),
      blobs = [];
  
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

  function readStorageItems( storageItems )
  {
    return Promise.all(storageItems.map(function (item) {
      // read the file
      return readFile(item);
    }));
  }

  function readFile(file)
  {
    $output.innerHTML += 'Reading the file ' + file.name + '\r\n';
    return new Promise((resolve, reject) => {
      var is_img = file.contentType.indexOf('image') > -1,
          blob_url,
          $img;
      file.openReadAsync()
        .then(bitmapStream => { 
          if (bitmapStream) { 
            $output.innerHTML += 'Getting bitmap data\r\n';
            blob_url = URL.createObjectURL(bitmapStream, { oneTimeOnly: true });
            if ( is_img )
            {
              $output.innerHTML += 'Creating the image\r\n';
              $img = $image.cloneNode(true);
              $img.src = blob_url;
              $images.appendChild($img);
            }
            blobs.push(blob_url)
          }
          // update the array
          resolve(blobs);
        })
        .catch(e => {
          $output.innerHTML += 'Error: ' + e + '\r\n';
        });
    });
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
      $output.innerHTML += 'contentSourceWebLink share\r\n';
      obj.weblink = data.properties.contentSourceWebLink.rawUri;
      $output.innerHTML += JSON.stringify(obj) + '\r\n';
    }

    if (data.contains(StandardDataFormats.text))
    {
      $output.innerHTML += 'Text share\r\n';
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
      $output.innerHTML += 'Weblink share\r\n';
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
      $output.innerHTML += 'Bitmap share\r\n';
      data.getBitmapAsync()
        .then(file => { return readFile(file); })
        .then(() => {
          obj.files = blobs;
          $output.innerHTML += JSON.stringify(obj) + '\r\n';
        })
        .catch(e => {
          $output.innerHTML += 'Error: ' + e + '\r\n';
        });
    }

    if (data.contains(StandardDataFormats.storageItems))
    {
      $output.innerHTML += 'File share\r\n';
      
      // get the storage items
      data.getStorageItemsAsync()
        // loop the storage items
        .then(storageItems => { return readStorageItems(storageItems); })
        // then get the blob
        .then(() => {
          obj.files = blobs;
          $output.innerHTML += JSON.stringify(obj) + '\r\n';
        })
        .catch(e => {
          $output.innerHTML += 'Error: ' + e + '\r\n';
        });;
    }

  }

  if ( 'ActivationEvent' in window )
  {
    activationHandler(window.ActivationEvent);
  }

}(this, this.document, this.Windows));