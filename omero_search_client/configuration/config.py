import os
import yaml
from shutil import copyfile


def load_configuration_variables_from_file(config):
    # loading application configuration variables from a file
    #print ("Injecting config variables from :%s" % omero_search_client_app_config.OMERO_SEARCH_CLIENT_INSTANCE_CONFIG)
    with open(omero_search_client_app_config.OMERO_SEARCH_CLIENT_INSTANCE_CONFIG) as f:
        cofg = yaml.load(f)
    for x, y in cofg.items():
        setattr(config, x, y)

class omero_search_client_app_config (object):
    # the configuration can be loadd from yml file later
    SECRET_KEY= "sdljhfdkfgsdvbflfvsdfafgdf"
    home_folder = os.path.expanduser('~')
    OMERO_SEARCH_CLIENT_INSTANCE_CONFIG = os.path.join(home_folder, '.omero_search_client.yml')
    if not os.path.isfile(OMERO_SEARCH_CLIENT_INSTANCE_CONFIG):
        LOCAL_CONFIG_FILE = os.path.join(os.path.abspath(os.path.dirname(__file__)),
                                         'omero_search_client.yml')
        copyfile(LOCAL_CONFIG_FILE, OMERO_SEARCH_CLIENT_INSTANCE_CONFIG)
        #print (LOCAL_CONFIG_FILE, OMERO_SEARCH_CLIENT_INSTANCE_CONFIG)

class development_app_config(omero_search_client_app_config):
    DEBUG = False
    VERIFY = False

class production_app_config(omero_search_client_app_config):
    pass

class test_app_config(omero_search_client_app_config):
    pass

configLooader = {
    'development': development_app_config,
    'testing': test_app_config,
    'production': production_app_config
}
