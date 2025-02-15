import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ClientService } from 'src/app/client-details/client.service';
import { IClient } from 'src/app/client-details/IClient';
import { IProject } from '../IProject';
import { ProjectService } from '../project.service';
import { NotificationService } from '../../notification-service/notification.service';

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
})
export class ProjectFormComponent implements OnInit {
  clientList!: IClient[];

  constructor(
    public service: ProjectService,
    public notificationService: NotificationService,
    public dialogRef: MatDialogRef<ProjectFormComponent>,
    public clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.clientService.getClientData().subscribe((data: IClient[]) => {
      this.clientList = data;
    });
  }

  changeClient(e: any) {
    console.log(e.target.value);
  }
  onClear() {
    this.service.form.reset();
    this.service.initializeFormGroup();
  }

  onSubmit() {
    let found: boolean;
    if (this.service.form.valid) {
      console.log(this.service.form.value);
      const saveData: IProject = {
        projectId: this.service.form.value.projectId,
        projectName: this.service.form.value.projectName,
        projectLocation: this.service.form.value.projectLocation,
        projectLead: this.service.form.value.projectLead,
        projectType: this.service.form.value.projectType,
        clientId: this.service.form.value.client.clientId,
      };
      this.service.insertProject(saveData).subscribe(
        (data) => {
          console.log(data);
          this.service.projectList.forEach((project, index) => {
            if (
              Array.isArray(data) &&
              project.projectId === data[0].projectId
            ) {
              this.service.projectList[index] = data[0];
              this.service.projectList = [...this.service.projectList];
              found = true;
              this.notificationService.showSuccess(
                'Success',
                'Project Updated Successfully'
              );
              this.dialogRef.close(true);
            }
          });
          if (!found && Array.isArray(data)) {
            this.notificationService.showSuccess(
              'Success',
              'Project Added Successfully'
            );
            this.service.projectList = [...this.service.projectList, data[0]];
            this.dialogRef.close(true);
          }
          this.service.projectListForFilter = [...this.service.projectList];
        },
        (err) => {
          if (err.status === 400) {
            this.notificationService.showError(
              'Failure',
              'Project Already Present'
            );
            this.dialogRef.close(false);
          }
        }
      );
      this.service.form.reset();
    }
  }

  onClose() {
    this.service.form.reset();
    this.service.initializeFormGroup();
    this.dialogRef.close();
  }
}
