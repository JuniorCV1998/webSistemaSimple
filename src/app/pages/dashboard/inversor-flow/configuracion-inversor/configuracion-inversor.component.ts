import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { catchError, finalize, throwError } from 'rxjs';
import { Constantes } from '../../../../core/constant/Constantes';
import { FormatNumberPipe } from '../../../../core/pipes/format-number.pipe';
import { FirebaseStorageService } from '../../../../core/services/firebase/firebase-storage.service';
import { InversoresService } from '../../../../core/services/inversores/inversores.service';
import { LoadingComponent } from '../../../modal/loading/loading.component';
import { MessagePopUpComponent } from '../../../modal/message-pop-up/message-pop-up.component';
import { ErrorGeneralComponent } from '../../../system/errores/error-general/error-general.component';
import { LoginService } from '../../../../core/services/auth/login/login.service';
import { TempDataService } from '../../../../core/services/temp-data.service';

@Component({
  selector: 'app-configuracion-inversor',
  standalone: true,
  imports: [ToastModule, FormsModule, ErrorGeneralComponent, CommonModule, LoadingComponent,
    ButtonModule, MessageModule, SelectModule, Checkbox, FormatNumberPipe],
  providers: [ConfirmationService, MessageService,],
  templateUrl: './configuracion-inversor.component.html',
  styleUrl: './configuracion-inversor.component.scss'
})
export default class ConfiguracionInversorComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInputSello') fileInputSello!: ElementRef<HTMLInputElement>;

  /* Codigo Unico del del inversor */
  codUnico: string | null = null;

  /* Mensaje de error */
  errorBody: string = '';
  mostrarError: boolean = false;

  /* Objetos */
  webPublic: any = {};
  periodTest: any = {};
  mantenimiento: any = {};
  originalValues: any = {}; // para guardar los valores iniciales
  changedValues: any[] = [];

  checked: boolean = true;

  /* Logo personalizado */
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;

  previewUrlSello: string | ArrayBuffer | null = null;
  selectedFileSello: File | null = null;
  selectedFileNameSello: string | null = null;

  /* configuracion */
  // Objet Moneda
  selectedMoneda: any = null;
  // Object Monto
  montoLimits: any = [];
  montoIndex = 0;
  selectedMonto: any = {};
  montoMaximo: number = 0;
  // Object Interes
  interesLimits: any = [];
  interesIndex = 0;
  selectedInteres: any = {};
  interesMaximo: number = 0;

  tipoMonedas: any = [];
  config: any = {};

  configUpdate: any = {};
  hasChanges = false;

  currency: string | null = null;

  constructor(
    private inversoresService: InversoresService,
    public dialogService: DialogService,
    private messageService: MessageService,
    private firebaseStorage: FirebaseStorageService,
    private tempDataService: TempDataService
  ) {
    const loginService = inject(LoginService);
    const decodedToken = loginService.getDecodedToken();
    if (decodedToken) this.codUnico = decodedToken.codigoUnico;

    this.currency = this.tempDataService.getConstant('currency') || 'S/';
  }

  ngOnInit(): void {

    setTimeout(() => {
      this.loadingComponent.show();
      this.getConfiguracionAdmin();
    });


  }

  ngAfterViewInit(): void {
    //this.onSliderChange();
  }


  getConfiguracionAdmin() {
    this.loadingComponent.show();
    this.inversoresService.getConfiguracionInv().pipe(
      finalize(() => this.loadingComponent.hide()),
      catchError((error) => {
        // Configuro el mensaje dinámico
        this.errorBody = error.error?.descripcion;
        this.mostrarError = true;

        return throwError(() => error);
      })
    ).subscribe((resp: any) => {
      this.montoLimits = resp.montoLimits;
      this.interesLimits = resp.interesLimits;
      this.tipoMonedas = resp.monedas;
      this.config = structuredClone(resp.config);
      this.configUpdate = structuredClone(resp.config);; // Se utiliza como diferenciador de this.config

      this.setearValuesConfig(this.config.pathLogo, this.config.pathSello, resp.config.idMoneda, resp.config.idMonto, resp.config.idInteres);
    });
  }

  updateConfigField(field?: string) {
    setTimeout(() => {
      if (field === 'moneda') {
        this.configUpdate.idMoneda = this.selectedMoneda?.idMoneda ?? null;
      }
      if (field === 'monto') {
        this.selectedMonto = this.montoLimits[this.montoIndex];
        this.configUpdate.idMonto = this.selectedMonto?.idMonto ?? null;
      }
      if (field === 'interes') {
        this.selectedInteres = this.interesLimits[this.interesIndex];
        this.configUpdate.idInteres = this.selectedInteres?.idInteres ?? null;
      }
      if (field === 'logo') {
        this.configUpdate.pathLogo = this.previewUrl;
      }
      if (field === 'sello') {
        this.configUpdate.pathSello = this.previewUrlSello;
      }

      this.checkChanges();
    });
  }

  checkChanges() {
    this.hasChanges = JSON.stringify(this.config) !== JSON.stringify(this.configUpdate);
  }



  private extractFileName(url: string): string {
    try {
      const decodedUrl = decodeURIComponent(url);
      const parts = decodedUrl.split('/');
      const lastPart = parts[parts.length - 1];
      const nameParam = lastPart.split('?')[0]; // quitar parámetros ?alt=media&token=...
      return nameParam || 'imagen.png';
    } catch {
      return 'imagen.png';
    }
  }

  onSliderChange(n: number) {
    if (n === 1) this.selectedMonto = this.montoLimits[this.montoIndex];
    else if (n === 2) this.selectedInteres = this.interesLimits[this.interesIndex];
  }

  setearValuesConfig(pathLogo: string, pathSello: string, idMoneda: number, idMonto: number, idInteres: number) {
    // Buscar el objeto con el idMoneda que venga en la respuesta
    this.selectedMoneda = this.tipoMonedas.find(
      (m: any) => m.idMoneda === idMoneda
    );
    const indexM = this.montoLimits.findIndex((m: any) => m.idMonto === idMonto);
    // Si lo encontró, actualiza el slider y el monto seleccionado
    if (indexM !== -1) this.montoIndex = indexM;
    // Buscar el objeto con el idMonto que venga en la respuesta
    this.selectedMonto = this.montoLimits.find(
      (m: any) => m.idMonto === idMonto
    );
    const indexI = this.interesLimits.findIndex((m: any) => m.idInteres === idInteres);
    // Si lo encontró, actualiza el slider y el monto seleccionado
    if (indexI !== -1) this.interesIndex = indexI;
    // Buscar el objeto con el idMonto que venga en la respuesta
    this.selectedInteres = this.interesLimits.find(
      (m: any) => m.idInteres === idInteres
    );
    // Seteamos los Máximos de Monto e Interes
    this.montoMaximo = Math.max(...this.montoLimits.map((m: any) => m.montoMax));
    this.interesMaximo = Math.max(...this.interesLimits.map((m: any) => m.interesMax));

    // Mostrar logo si existe 
    if (pathLogo) {
      this.previewUrl = this.config.pathLogo;
      this.selectedFileName = this.extractFileName(this.config.pathLogo);
    }
    // Mostrar sello si existe

    if (pathSello) {
      if(pathLogo === pathSello && pathSello) this.checked = true;
      else this.checked = false;
      this.previewUrlSello = this.config.pathSello;
      this.selectedFileNameSello = this.extractFileName(this.config.pathSello);
    }
  }

  async updateConfigInv() {
    this.loadingComponent.show();

    try {
      // Subir LOGO si hay archivo nuevo
      if (this.selectedFile) {
        const downloadURL = await this.firebaseStorage.uploadImage(
          this.selectedFile,
          `logo/logo_${this.codUnico}.png`
        );
        this.configUpdate.pathLogo = downloadURL;
        sessionStorage.setItem('pathLogo', downloadURL);
      }

      // Subir SELLO si hay archivo nuevo
      if(this.checked){
        this.configUpdate.pathSello = this.configUpdate.pathLogo;
      }
      else if(this.selectedFileSello) {
        const downloadURL = await this.firebaseStorage.uploadImage(
          this.selectedFileSello,
          `sello/sello_${this.codUnico}.png`
        );
        this.configUpdate.pathSello = downloadURL;
        sessionStorage.setItem('pathSello', downloadURL);
      }

      // Llamar al backend con la configuración final
      this.inversoresService.updateConfiguracionInv(this.configUpdate).pipe(
        finalize(() => this.loadingComponent.hide()),
        catchError((error) => {
          const messageData = {
            severity: 'error',
            summary: Constantes.MSG_SERVICE_ERROR,
            detail: error.error.descripcion,
            life: 3000
          };
          this.messageService.add(messageData);
          return throwError(() => error);
        })
      ).subscribe((resp: any) => {
        if (resp.codigo === Constantes.STATUS_SUCCESS_SV) {
          const messageData = {
            severity: 'success',
            summary: Constantes.MSG_SERVICE_UPDATE,
            detail: Constantes.MSG_SERVICE_DESC_UPDATE,
            life: 3000
          };
          this.messageService.add(messageData);
          this.getConfiguracionAdmin();
          this.hasChanges = false;
          // Limpiar los archivos seleccionados
          this.selectedFile = null;
          this.selectedFileSello = null;
          //setear nuevo simbolo, data temp moneda
          if(this.selectedMoneda) this.tempDataService.setConstant('currency', this.selectedMoneda.simbolo);
        }
      });

    } catch (error) {
      this.loadingComponent.hide();
      this.showImageError("Error al subir una imagen. Inténtalo nuevamente.");
    }
  }


  /* Logo personalizado */
  onFileSelected(event: Event, tipo: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      this.showImageError("Solo se permiten imágenes en formato PNG, JPG o SVG.");
      return;
    }

    const maxSize = 200 * 1024;
    if (file.size > maxSize) {
      this.showImageError("El archivo es muy grande. Máximo 200 KB.");
      return;
    }

    if (file.type !== 'image/svg+xml') {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const { width, height } = img;
        const ratio = width / height;

        if (ratio < 0.95 || ratio > 1.05) {
          this.showImageError(`La imagen debe ser cuadrada. Dimensiones actuales: ${width}x${height}`);
          URL.revokeObjectURL(objectUrl);
          return;
        }

        this.previewImage(objectUrl, tipo);
        if (tipo === 'logo') {
          this.selectedFile = file;
          this.selectedFileName = file.name;
        } else if (tipo === 'sello') {
          this.selectedFileSello = file;
          this.selectedFileNameSello = file.name;
        }

        this.updateConfigField(tipo);
      };
      img.src = objectUrl;
    } else {
      // SVG directo
      this.previewImage(URL.createObjectURL(file), tipo);
      if (tipo === 'logo') {
        this.selectedFile = file;
        this.selectedFileName = file.name;
      } else if (tipo === 'sello') {
        this.selectedFileSello = file;
        this.selectedFileNameSello = file.name;
      }
      this.updateConfigField(tipo);
    }
  }


  showImageError(message: string) {
    const ref = this.dialogService.open(MessagePopUpComponent, {
      data: {
        message: message
      },
      header: Constantes.MSG_IMAGEN_ERROR,
      closable: false,
      modal: true,
      width: '80%'
    });
  }

  previewImage(url: string, tipo: string): void {
    if (tipo === 'logo') this.previewUrl = url;
    else if (tipo === 'sello') this.previewUrlSello = url;

  }

  removeImage(tipo: string): void {
    if (tipo === 'logo') {
      this.previewUrl = null;
      this.selectedFileName = null;
      this.fileInput.nativeElement.value = '';
    }
    else if (tipo === 'sello') {
      this.previewUrlSello = null;
      this.selectedFileNameSello = null;
      this.fileInputSello.nativeElement.value = '';
    }
    this.updateConfigField(tipo);

  }

}
