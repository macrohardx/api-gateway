import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {

    constructor(private modalService: NgbModal, private http: HttpClient) { 

    }
    img;
    ngOnInit() {
    }

    public cuzin(img) {
        console.log(img)
        this.img = img
    }

    public openModal(content) {
        this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result
            .then((result) => {

            }, (reason) => {

            });
    }
    
    public savePic() {
        this.http.put('/api/user/profile-pic', { base64: this.img })
            .subscribe((response) => {
                console.log(response);
            })
    }

}
