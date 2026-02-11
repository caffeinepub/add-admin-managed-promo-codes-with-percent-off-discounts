import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";

module {
  public type OrderStatus = {
    #pending;
    #shipped;
  };
  public type PaymentContactStatus = {
    #notContacted;
    #contacted;
    #paymentReceived;
  };

  public type ShippingAddress = {
    street : Text;
    city : Text;
    state : Text;
    zip : Text;
  };

  public type Signature = {
    idBadgeNumber : Text;
    photo : ?Storage.ExternalBlob;
  };

  public type Order = {
    id : Nat;
    customerName : Text;
    email : Text;
    phone : Text;
    status : OrderStatus;
    createdTime : Int;
    owner : Principal;
    shippingAddress : ShippingAddress;
    signature : ?Signature;
    paymentContactStatus : PaymentContactStatus;
    contactNotes : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  public type Actor = {
    accessControlState : AccessControl.AccessControlState;
    orders : Map.Map<Nat, Order>;
    nextOrderId : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
  };
};
