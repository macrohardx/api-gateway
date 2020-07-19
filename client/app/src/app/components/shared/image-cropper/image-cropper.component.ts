import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { IMaybe } from '../../../building-blocks/IMaybe'
import { CropperComponent } from 'angular-cropperjs'
import * as pica from 'pica'

@Component({
    selector: 'app-image-cropper',
    styleUrls: ['./image-cropper.component.sass'],
    template: `
    <angular-cropper #angularCropper [cropperOptions]="cropperConfig" [imageUrl]="imageSrc" *ngIf="imageSrc"></angular-cropper>
    <input type="file" (change)="onFileChange($event)"/>
    <button (click)="crop()" *ngIf="imageSrc">Crop</button>`
})
export class ImageCropperComponent implements OnInit {

    constructor() { }

    public imageSrc: String;

    public resizer;

    public resizerConfig = {
        unsharpAmount: 80,
        unsharpRadius: 0.6,
        unsharpThreshold: 2
    }

    @ViewChild('angularCropper')
    public angularCropper: CropperComponent;

    public cropperConfig = { aspectRatio: 1, viewMode: 1 };

    @Output()
    public imageCropped = new EventEmitter<string>()

    public ngOnInit(): void {
        this.resizer = pica({ features: ['js', 'wasm', 'ww', 'cib'] });
    }

    public async onFileChange(event) {
        let maybeBase64 = await this._blobToBase64(event.target.files[0])
        if (maybeBase64.ok) {
            this.imageSrc = maybeBase64.data
        }
    }

    private _blobToBase64(blob): Promise<IMaybe> {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = () => {
                resolve({ data: reader.result, ok: true })
            }
            reader.onerror = (error) => {
                resolve({ error: error.toString(), ok: false })
            }
        });
    };

    public async crop() {
        try {
            let srcCanvas = this.angularCropper.cropper.getCroppedCanvas();
            let canvasDest = document.createElement('canvas');
            canvasDest.width = srcCanvas.width;
            canvasDest.height = srcCanvas.height;

            let resizeResult = await this.resizer.resize(srcCanvas, canvasDest, this.resizerConfig)
            let blob = await this.resizer.toBlob(resizeResult, 'image/jpeg', 0.8)
            let maybeBase64 = await this._blobToBase64(blob);
            if (maybeBase64.ok) {
                this.imageCropped.emit(maybeBase64.data)
            }
        } catch (error) {
            console.log(error)
        }
    }
}
