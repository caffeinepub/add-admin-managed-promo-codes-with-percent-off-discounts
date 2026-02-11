import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";

module {
  type Time = Time.Time;

  public type OrderStatus = {
    #pending;
    #shipped;
  };
  public type PaymentContactStatus = {
    #notContacted;
    #contacted;
    #paymentReceived;
  };

  public type IDInformation = {
    height : Text;
    hairColor : Text;
    eyeColor : Text;
    weight : Text;
    dateOfBirth : Text;
    sex : Text;
    photo : ?Storage.ExternalBlob;
    signature : ?Storage.ExternalBlob;
  };

  public type ShippingAddress = {
    street : Text;
    city : Text;
    state : Text;
    zip : Text;
  };

  type OldSignature = {
    idBadgeNumber : Text;
    photo : ?Storage.ExternalBlob;
  };

  public type Order = {
    id : Nat;
    customerName : Text;
    email : Text;
    phone : Text;
    status : OrderStatus;
    createdTime : Time;
    owner : Principal;
    shippingAddress : ShippingAddress;
    idInfo : IDInformation;
    paymentContactStatus : PaymentContactStatus;
    contactNotes : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  public type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    orders : Map.Map<Nat, Order>;
    nextOrderId : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    orders : Map.Map<Nat, Order>;
    nextOrderId : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
