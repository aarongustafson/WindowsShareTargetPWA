(function(window, document, Windows){

  let addWinJS = new Promise((resolve, reject) => {
    $output.innerHTML += 'adding scripts';
    var script = document.createElement('script');
    script.src = '//Microsoft.WinJS.2.0/js/base.js';
    document.body.appendChild(script.cloneNode(true));
  
    script.src = '//Microsoft.WinJS.2.0/js/ui.js';
    document.body.appendChild(script);
    $output.innerHTML += 'WinJS added';
  });
  
  function initialize()
  {
    addWinJS.then(() => {
      WinJS.Application.addEventListener("activated", activatedHandler, false);
      WinJS.Application.addEventListener("shareready", shareReady, false);
      WinJS.Application.start();
    });
    $output.innerHTML += 'Initialized';
  }

  function activatedHandler(e)
  { 
    if (e.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.shareTarget)
    { 
      e.setPromise(WinJS.UI.processAll());

        // We receive the ShareOperation object as part of the eventArgs 
        shareOperation = e.detail.shareOperation; 

        // We queue an asychronous event so that working with the ShareOperation object does not 
        // block or delay the return of the activation handler. 
        WinJS.Application.queueEvent({ type: "shareready" }); 
    } 
  } 

  function shareReady(eventArgs)
  { 
    var obj = {
      title: shareOperation.data.properties.title,
      description: shareOperation.data.properties.description
    };

    if (shareOperation.data.properties.contentSourceWebLink)
    { 
      obj.contentSourceWebLink = shareOperation.data.properties.contentSourceWebLink.rawUri;
    }

    if (shareOperation.data.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text))
    {
      shareOperation.data.getTextAsync()
        .done(function (text) { 
            obj.content = text; 
          },
          function (e) { 
            $output.innerHTML += 'Error retrieving text data';
            console.log(e); 
          }); 
    }
    if (shareOperation.data.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink))
    { 
      shareOperation.data.getWebLinkAsync()
        .done(function (webLink) { 
            obj.weblink = webLink.rawUri;
          },
          function (e) { 
            $output.innerHTML += 'Error retrieving weblink data';
            console.log(e); 
          });
    } 
    
    if (shareOperation.data.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap))
    { 
      shareOperation.data.getBitmapAsync()
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

  initialize();

}(this, this.document, this.Windows));