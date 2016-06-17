var app = angular.module("muralUniversitario", ["valdr"]);

app.config(function(valdrProvider) {
  valdrProvider.addConstraints({
    'Professor': {
      'professor[nome]': {
        'required': {
          'message': 'Campo obrigatório.'
        }
      },
      'professor[universidade]': {
        'required': {
          'message': 'Campo obrigatório.'
        }
      },
      'professor[cursos]': {
        'required': {
          'message': 'Campo obrigatório.'
        }
      },
      'professor[disciplinas]': {
        'required': {
          'message': 'Campo obrigatório.'
        }
      }
    }
  });
});