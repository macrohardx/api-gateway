import { RootComponent } from '../components/root/root.component';
import { HomeComponent } from '../components/home/home.component';

export const AppStates = [
    {
        abstract: true,
        name: 'root',
        url: '',
        views: {
            '@': { component: RootComponent }
        }
    },
    {
        parent: 'root',
        name: 'home',
        url: '/home',
        views: {
            'main@root': { component: HomeComponent }
        }
    }
]