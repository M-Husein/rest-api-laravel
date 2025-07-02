<?php
namespace App\Exceptions;
use Exception;

abstract class BaseAppException extends Exception{
  public function __construct(
    string $message = 'Something went wrong.', // 'Application error occurred.',
    int $code = 400,
    protected mixed $errors = null
  ){
    parent::__construct($message, $code);
  }

  public function getErrors(): mixed{
    return $this->errors;
  }

  // Optional: override this in children to attach error_code or translation key
  // public function getErrorCode(): ?string{
  //   return null;
  // }
}