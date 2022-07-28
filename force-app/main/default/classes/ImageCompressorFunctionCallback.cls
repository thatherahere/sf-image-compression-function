public class ImageCompressorFunctionCallback implements functions.FunctionCallback {
     
    public void handleResponse(functions.FunctionInvocation invocation) {
        try {
            functions.FunctionInvocationStatus status = invocation.getStatus();
            switch on status {
                when SUCCESS {
                    handleSuccess(invocation.getResponse());
                }
                when ERROR {
                    handleFailure( invocation );
                }
            }
        } catch (Exception e) {
            // Handle Exception 
        }
    }
    
    private void handleSuccess(String rawResponse) {
        try {
            System.debug( 'rawResponse: ' +rawResponse);
            Map<String, list<String>> response = (Map<String, list<String>>) JSON.deserialize(rawResponse, Map<String, list<String>>.class );
            if( response.get('successCVIds') != null ){
                // following contents were successfully compressed with a new version.
                System.debug('successCVIds: '+ response.get('successCVIds') );
            }
            if( response.get('failedCVIds') != null ){
                // following content were failed.
                System.debug('failedCVIds: '+ response.get('failedCVIds') );
            }
        } catch (Exception e) {
            throw new FunctionException(
                'failed to parse JSON response: ' + rawResponse
            );
        }
    }
    
    private void handleFailure(functions.FunctionInvocation invocation) {
        // Handle failure 
        throw new FunctionException(invocation.getError().getMessage());
    }
    
    public class FunctionException extends Exception {
    }
}