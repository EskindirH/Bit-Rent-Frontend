export interface Property{
    id?: string |null;
    description?: string | null;
    price?: string | null;
    isAvailable?: string | null;
    filePath?: any;
    photoFile?: Blob | null;
    ownerId?: string | null;
    customerId?: string | null;
    
}