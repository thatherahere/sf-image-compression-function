public with sharing class ContentDocumentLinkTriggerHandler {
    
    static Boolean firstRun = true;
    
    private static final String IMAGE_COMPRESSOR_FUNCTION = 'sfimagecompressionfunction.sfimagecompression';

    public void afterInsert(List<ContentDocumentLink> newDocLinks) {
        processNewDocumentLinks(newDocLinks);
    }

    private void processNewDocumentLinks(List<ContentDocumentLink> docLinks) {
        // Filter docs based on settings
        Map<Id, ContentDocumentLink> filteredLinks = new Map<Id, ContentDocumentLink>();
        for (ContentDocumentLink link : docLinks) {
            filteredLinks.put(link.ContentDocumentId, link);
        }
        // Share and import relevant docs
        if (filteredLinks.size() > 0) {
            if( firstRun ){
 	           shareDocuments(filteredLinks.values());
                List<ContentDocumentInfo> files = getDocumentInfos( filteredLinks );
                RequestWrapper requestWrap = new RequestWrapper();
                requestWrap.sharpConfiguration.put('quality', 50);
                requestWrap.files = files;
                callImageCompressionFunction( requestWrap );
            }
        }
    }

    /**
     * Share documents with the Cloud Integration user for Function access
     */
    private void shareDocuments(List<ContentDocumentLink> docLinks) {
        User cloudIntegrationUser = [
            SELECT Id, UserName
            FROM User
            WHERE username LIKE 'cloud@00d%'
            LIMIT 1
        ];
        List<ContentDocumentLink> newLinks = new List<ContentDocumentLink>();
        for (ContentDocumentLink docLink : docLinks) {
            ContentDocumentLink newLink = new ContentDocumentLink();
            newLink.ContentDocumentId = docLink.ContentDocumentId;
            newLink.LinkedEntityId = cloudIntegrationUser.Id;
            newLink.ShareType = 'C';
            newLinks.add(newLink);
        }
        ContentDocumentLinkTriggerHandler.firstRun = false;
        insert newLinks;
    }

    private List<ContentDocumentInfo> getDocumentInfos( Map<Id, ContentDocumentLink> docMap ) {
        
        list<String> fileTypes = new list<String>{'png', 'jpg', 'jpeg'};
        List<ContentDocumentInfo> docs = new List<ContentDocumentInfo>();
        Set<Id> docIds = docMap.keySet();
        List<ContentVersion> versions = [
            SELECT Id, ContentDocumentId, PathOnClient, OwnerId, Title, FileExtension
            FROM ContentVersion
            WHERE IsLatest = TRUE AND ContentDocumentId IN :docIds AND FileType IN:fileTypes 
        ];
        for (ContentVersion version : versions) {
            ContentDocumentLink docLink = docMap.get(version.ContentDocumentId);
            ContentDocumentInfo doc = new ContentDocumentInfo();
            doc.title = version.Title+'.'+version.FileExtension;
            doc.contentVersionId = version.Id;
            doc.contentDocumentId = version.ContentDocumentId;
            doc.pathOnClient = version.PathOnClient;
            doc.FileExtension = version.FileExtension;
            doc.ownerId = version.OwnerId;
            docs.add(doc);
        }
        return docs;
    }

    private void callImageCompressionFunction( RequestWrapper requestWrap ) {
        String payload = JSON.serialize(requestWrap);
        functions.Function function = functions.Function.get(
            IMAGE_COMPRESSOR_FUNCTION
        );
        functions.FunctionInvocation invocation = function.invoke(
            payload,
            new ImageCompressorFunctionCallback()
        );
    }

    public class RequestWrapper{
        public Map<String, Object> sharpConfiguration;
        public list<ContentDocumentInfo> files;
        
        public RequestWrapper(){
            sharpConfiguration = new Map<String, Object>();
            files = new list<ContentDocumentInfo>();
        }
    }
    
    public class ContentDocumentInfo {
        public Id contentDocumentId;
        public Id contentVersionId;
        public String title;
        public String pathOnClient;
        public String fileExtension;
        public Id ownerId;
    }
}