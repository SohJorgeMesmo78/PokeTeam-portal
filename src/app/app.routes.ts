import { Routes } from '@angular/router';
import { PokemonListComponent } from './components/pokemon-list/pokemon-list';
import { PokemonFullDetailComponent } from './components/pokemon-full-detail/pokemon-full-detail';
import { TeamBuilderComponent } from './components/team-builder/team-builder';
import { TeamCreatorComponent } from './components/team-creator/team-creator';
import { GameVersionsComponent } from './components/game-versions/game-versions';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'pokedex', pathMatch: 'full' },
  { path: 'pokedex', component: PokemonListComponent },
  { path: 'pokemon/:idOrName', component: PokemonFullDetailComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'team-builder', component: TeamBuilderComponent, canActivate: [authGuard] },
  { path: 'team-builder/new', component: TeamCreatorComponent, canActivate: [authGuard] },
  { path: 'team-builder/edit/:id', component: TeamCreatorComponent, canActivate: [authGuard] },
  { path: 'game-versions', component: GameVersionsComponent },
  { path: '**', redirectTo: 'pokedex' }
];
