import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi, withJsonpSupport } from "@angular/common/http";
import { ApplicationConfig, importProvidersFrom, inject } from '@angular/core';
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { provideAnimations } from "@angular/platform-browser/animations";
import { RouterModule } from '@angular/router';
import { InMemoryCache, split } from "@apollo/client/core";
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from "@apollo/client/utilities";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { provideNamedApollo } from "apollo-angular";
import { HttpLink } from "apollo-angular/http";
import { createClient } from 'graphql-ws';
import { environment } from "../environments/environment";
import { routes } from './app.routes';
import { storageKey } from "./core/constants/storage-key";
import { ServiceInterceptor } from "./core/services/service-interceptor";
import { CustomMatPaginatorIntl } from "./core/utils/pagination-intl";
import { CustomTranslateLoader } from "./core/services/custom-translate-loader";
const { extractFiles } = require('extract-files');
// export function HttpLoaderFactory(httpClient: HttpClient) {
//   return new TranslateHttpLoader(httpClient, './assets/languages/', '.json');
// }
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new CustomTranslateLoader(httpClient);
}

export const translateConfig = TranslateModule.forRoot({
  defaultLanguage: 'vi',
  loader: {
    provide: TranslateLoader,
    useFactory: HttpLoaderFactory,
    deps: [HttpClient]
  }
});
export const _provideNamedApollo = provideNamedApollo(() => {
  const httpLink = inject(HttpLink);
  const http = httpLink.create({
    uri: environment.apiGraphQL,
    extractFiles: body => extractFiles(body),
  })
  const ws = new GraphQLWsLink(
    createClient({
      url: environment.socket,
      connectionParams: async () => {
        const token = localStorage.getItem(storageKey.token) || '';
        return {
          authorization: `Bearer ${token}`,
        };
      },
      on: {
        connected: () => console.log('WebSocket connected'),
        error: (error) => console.error('WebSocket error:', error),
      },
    })
  );
  const link = split(({ query }) => {
    const operationDefinitionNode = getMainDefinition(query);
    return operationDefinitionNode.kind === 'OperationDefinition' && operationDefinitionNode.operation === 'subscription';
  }, ws, http)
  return {
    default: {
      link: link,
      cache: new InMemoryCache(),
    },
  }
})
export const appConfig: ApplicationConfig = {
  providers: [
    // provideRouter(routes),
    // provideStore(),
    provideNativeDateAdapter(),
    importProvidersFrom([
      RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })
    ]),
    provideAnimations(),
    provideHttpClient(
      withInterceptorsFromDi(),
      withJsonpSupport()
    ),
    _provideNamedApollo,
    importProvidersFrom([
      translateConfig,
      // AngularFireModule.initializeApp(environment.firebaseConfig),
    ]),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ServiceInterceptor,
      multi: true,
    },
    {
      provide: 'API_CONFIG',
      useValue: { baseUrl: environment.apiRestFull },
    },
    {
      provide: MatPaginatorIntl,
      useFactory: CustomMatPaginatorIntl
    },
  ],
};
