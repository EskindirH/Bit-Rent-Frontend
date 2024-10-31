import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnInit, Sanitizer, ViewChild } from '@angular/core';
import { Property } from '../model/property';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AddPropertyViewModel } from '../viewModel/AddPropertyViewModel';
import { EditPropertyViewModel } from '../viewModel/EditPropertyViewModel';
import { PropertyService } from '../data-services/property.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface ApiResponse {
    id?: string |null;
    description?: string | null;
    price?: string | null;
    isAvailable?: string | null;
    filePath?: any;
    photoFile?: Blob | null;
    ownerId?: string | null;
    customerId?: string | null;
}
@Component({
  selector: 'app-list-property',
  templateUrl: './list-property.component.html',
  styleUrls: ['./list-property.component.css']
})
export class ListPropertyComponent implements AfterViewInit {

  err!: string | null;
  notification!: string | null

  selection = new SelectionModel<Property>(true, []);
  properties: Property[] = []
  resultLength? = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  //paginator!: MatPaginator;
  //sort!: MatSort;
  AddPropertyComponent: boolean = false;
  EditPropertyComponent: boolean = false;
  ModalTitle?: string;
  ModalTitleTwo?: string;

  
  
  addProperty: AddPropertyViewModel = {
    description: null,
    price: null,
    isAvailable: false,
    photo: null,
    ownerId: null,
    customerId: null
  }
  editProperty: EditPropertyViewModel= {
    id: '',
    description: '',
    price: '',
    isAvailable: false,
    filePath: '',
    ownerId: '',
    customerId: '',
    photo: null
  }

  apiResponse: ApiResponse[] = []
  //applyFilter(event: Event) {
   // const filterValue = (event.target as HTMLInputElement).value;
    //this.properties.filter = filterValue.trim().toLowerCase();
  //}

  photoName: string = ''
  

  constructor(private _prop: PropertyService, private sanitizer: DomSanitizer) { }
  ngAfterViewInit(): void {
    
  }

  ngOnInit(): void {
    
    this.loadData()
  }

  loadData() {
    this.isLoadingResults = true;
    this._prop.prop().subscribe({

      next: (response) => {
        this.isLoadingResults= false;
      const props = response.body || []

       this.apiResponse = props.map((prs)=>{
        let photoUrl: SafeUrl
        const dataUrl = `data:image/png;base64,${prs.photoFile}`;
        photoUrl = this.sanitizer.bypassSecurityTrustUrl(dataUrl);
      console.log(prs)
        return {
          id: prs.id,
          description: prs.description,
          price: prs.price,
          filePath: photoUrl,          
          isAvailable: prs.isAvailable,
          ownerId: prs.ownerId,
          photoFile: prs.photoFile,
          customerId: prs.customerId
        };
      })
        
      },
      error: (error) => {
        if (error.status === 401) {
          this.err = "Your session has been expired. Please login again.";
        } else {
          this.err = "Unknown error occured. Please try again latter, if the problem" +
            " persists contact your system administrator.";
        }
      }
    });
    
  }

  notificationHandler(msg: string) {
    if (msg.length > 0) {
      this.notification = msg;
      this.loadData()
    }
  }

  updateProp(id: string){
    this.ModalTitle = "Edit Property";
    this.EditPropertyComponent = true;
    this._prop.editProperty(id).subscribe({
      next: (resp) => {
        if (resp.status === 200) {
          this.editProperty = resp.body!
        }
      },
      error: (error) => {
        if (error.status === 401) {
          this.err = "Your session has been expired. Please login again.";
        } else {
          this.err = "Unknown error occured. Please try again latter, if the problem" +
            " persists contact your system administrator.";
        }
      }
    });
  }
  
  deleteProp(id: string) {
    this._prop.deleteUser(id).subscribe({
      next: (resp) => {        
        this.err = "Property deleted successfully."; 
        this.loadData()    
      },
      error: (error) => {
        if (error.status === 401) {
          this.err = "Your session has been expired. Please login again.";
        } else {
          this.err = "You can't delete this property. The account is in use.";
        }
      }
    })
  }

  confirmDelete(UniqueId: string, isDeleteClicked: boolean){
    var deleteSpan = 'deleteSpan_' + UniqueId;
    var confirmDeleteSpan = 'confirmDeleteSpan_' + UniqueId;
    if (isDeleteClicked) {
        $('#' + deleteSpan).hide();
        $('#' + confirmDeleteSpan).show();
    }
    else {
        $('#' + deleteSpan).show();
        $('#' + confirmDeleteSpan).hide();
    }
  }

  createProperty(){
    this.ModalTitle = "Add New Property"
    this.AddPropertyComponent = true
  }

  closeClick() {
    this.err = null
    this.notification = null
    this.AddPropertyComponent = false;
    this.EditPropertyComponent = false;
    this.loadData()
  }
}
