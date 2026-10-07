import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ProjectsService } from './services/projects.service';

// "/board" has no project in the URL, so send it to the board of the last visited project
// (or the first one). With no projects at all, the board page itself explains that.
export const redirectToProject: CanActivateFn = () => {
  const router = inject(Router);
  const projectsService = inject(ProjectsService);

  return projectsService.whenLoaded().pipe(
    map((projects) => {
      if (projects.length === 0) {
        return true;
      }

      const last = projectsService.lastProjectId();
      const target = projects.find((project) => project.id === last) ?? projects[0];
      return router.createUrlTree(['/board', target.id]);
    }),
    catchError(() => of(true)),
  );
};
