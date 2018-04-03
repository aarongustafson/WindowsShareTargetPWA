(function(window, document, Windows){

  let addWinJS = new Promise((resolve, reject) => {
    var script = document.createElement('script');
    script.src = '//Microsoft.WinJS.2.0/js/base.js';
    document.body.appendChild(script.cloneNode(true));
  
    script.src = '//Microsoft.WinJS.2.0/js/ui.js';
    document.body.appendChild(script);
  });
  
  function initialize()
  {
    addWinJS.then(() => {
      WinJS.Application.addEventListener("activated", activatedHandler, false);
      WinJS.Application.addEventListener("shareready", shareReady, false);
      WinJS.Application.start();
    });
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
            console.log('Error retrieving text data', e); 
          }); 
    }
    if (shareOperation.data.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink))
    { 
      shareOperation.data.getWebLinkAsync()
        .done(function (webLink) { 
            obj.weblink = webLink.rawUri;
          },
          function (e) { 
            console.log('Error retrieving weblink data', e); 
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
                  console.log('Error reading image stream', e); 
                }); 
          },
          function (e) { 
            console.log('Error retrieving image data', e); 
          }); 
    }
    
    console.log(obj);
  }

  initialize();

}(this, this.document, this.Windows));