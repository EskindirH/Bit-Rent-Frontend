import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AddPropertyViewModel } from '../viewModel/AddPropertyViewModel';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PropertyService } from '../data-services/property.service';

@Component({
  selector: 'app-add-property',
  templateUrl: './add-property.component.html',
  styleUrls: ['./add-property.component.css']
})
export class AddPropertyComponent implements OnInit {

  @Input() property!: AddPropertyViewModel;
  @Output() notify: EventEmitter<string> = new EventEmitter<string>()
  err!: string | null
  notification!: string | null;
  AddPropertyComponent: boolean = false;

  addPropertyForm = new FormGroup({

    photo: new FormControl<Blob | null>(null, Validators.required),
    description: new FormControl<string | null>(null,
      [Validators.required, Validators.minLength(3), Validators.maxLength(30)]),

    price: new FormControl<string | null>(null, [Validators.required]),
    isAvailable: new FormControl<boolean | null>(null, [Validators.required]),


  })

  get Photo() { return this.addPropertyForm.get('photo') };
  get Description() { return this.addPropertyForm.get('description') };
  get Price() { return this.addPropertyForm.get('price') };
  get IsAvailable() { return this.addPropertyForm.get('isAvailable') };
  get OwnerId() { return this.addPropertyForm.get('ownerId') };
  get CustomerId() { return this.addPropertyForm.get('customerId') };


  constructor(private _prop: PropertyService) { }

  ngOnInit(): void {

  }

  upload(event: any){
    const file = event.target.files[0];
  if (file) {
    this.property.photo = file;
  }
  }

  addProperty() {
    const formData = new FormData();
    formData.append('description', this.Description?.value || '');
    formData.append('price', this.Price?.value || '');
    formData.append('isAvailable', String(this.IsAvailable?.value || ''));
    formData.append('ownerId', this.OwnerId?.value || '');
    formData.append('customerId', this.CustomerId?.value || '');
    formData.append('photo', this.property.photo!, "photo.png")

    this._prop.addProperty(formData).subscribe({
      next: (resp) => {
        if(resp.statusText === "Ok"){
        this.notify.emit("Property registered successfully.");
        this.notification = "Property registered successfully."
        }
      },
      error: (error) => {
        if (error.status === 409) {
          this.err = "already exist!";
        } else {
          this.err = "Unknown error occured. Please try again latter, if the problem" +
            " persists contact your system administrator."
        }
      }
    });
  }
}
