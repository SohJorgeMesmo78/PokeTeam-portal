import { Routes } from '@angular/router';
import { PokemonListComponent } from './components/pokemon-list/pokemon-list';
import { TeamBuilderComponent } from './components/team-builder/team-builder';
import { GameVersionsComponent } from './components/game-versions/game-versions';

export const routes: Routes = [
  { path: '', redirectTo: 'pokedex', pathMatch: 'full' },
  { path: 'pokedex', component: PokemonListComponent },
  { path: 'team-builder', component: TeamBuilderComponent },
  { path: 'game-versions', component: GameVersionsComponent },
  { path: '**', redirectTo: 'pokedex' }
];
